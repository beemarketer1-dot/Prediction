/**
 * ============================================================================
 * FIFA Match Prediction Arena - Google Apps Script Backend (Code.gs)
 * ============================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open your Google Sheet where you want to store prediction entries.
 * 2. Click on "Extensions" -> "Apps Script".
 * 3. Delete any existing code in the editor and paste ALL of this code.
 * 4. Click the "Save" (disk icon) button.
 * 5. Click "Deploy" -> "New deployment" (top right).
 * 6. Click the gear/settings icon next to "Select type" and choose "Web app".
 * 7. Set Description: e.g., "FIFA Prediction Form Backend v1".
 * 8. Set Execute as: "Me (your email)".
 * 9. Set Who has access: "Anyone" (IMPORTANT: Must be set to Anyone so form can post without login).
 * 10. Click "Deploy" and authorize permissions when prompted.
 * 
 * Your active Web App URL:
 * https://script.google.com/macros/s/AKfycbw2E22rIWIYbP-rRUjoZO_MnwCPCV45s-dtCJ_aZkVV2avcSHMY9dSkfnmtOpfVo76hAQ/exec
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Automatically initialize header row if sheet is completely empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Full Name",
        "Phone Number",
        "Predicted Winner",
        "Match Score (90 Mins)",
        "Penalty Shootout Score"
      ];
      sheet.appendRow(headers);
      
      // Style header row cleanly with neon/dark aesthetic
      var headerRange = sheet.getRange("A1:F1");
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#00d2ff");
      headerRange.setFontColor("#060a12");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // Parse incoming data from URLSearchParams (e.parameter) or JSON postData
    var data = {};
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback parsing if needed
      }
    }
    
    // Extract individual form fields
    var timestamp = new Date();
    var fullName = data.fullName || "Anonymous";
    var phoneNumber = data.phoneNumber || "N/A";
    var winnerChoice = (data.winnerChoice || "Unknown").toUpperCase();
    var matchScore = data.matchScore || "0 - 0";
    var penaltyScore = data.penaltyScore || "N/A";
    
    // Append user prediction as a new row in Google Sheet
    sheet.appendRow([
      timestamp,
      fullName,
      phoneNumber,
      winnerChoice,
      matchScore,
      penaltyScore
    ]);
    
    // Return success JSON response
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Prediction successfully saved to Google Sheet!",
      row: sheet.getLastRow() 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response gracefully
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional helper function to test saving a sample row directly inside Apps Script editor
 */
function testDoPost() {
  var sampleEvent = {
    parameter: {
      fullName: "Lionel Messi (Test)",
      phoneNumber: "+1 (555) 019-2834",
      winnerChoice: "ARGENTINA",
      matchScore: "3 - 3",
      penaltyScore: "5 - 4 (ARG)"
    }
  };
  var output = doPost(sampleEvent);
  Logger.log(output.getContent());
}

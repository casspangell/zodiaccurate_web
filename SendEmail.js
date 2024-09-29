function sendWelcomeEmail(email, clientName, editResponseUrl) {
  var subject = "Welcome to Your New Journey with Zodiaccurate!";
  
  var message = `
    <p>Hi ${clientName},</p>
  
    <p>Welcome to Zodiaccurate! We're thrilled that you've decided to join our community.</p>
    
    <p>Every day at 6 AM, you'll receive a personalized astrological reading tailored specifically to the details you've shared with us. Our goal is to provide you with insights that not only assist you to better navigate guide your daily decisions but also align that guidance with your personal life conditions, struggles and successes!<br></p>
  
    <p>If you ever need to update your Zodiaccurate “current life” information, you can easily do so by <a href="${editResponseUrl}">Clicking Here</a><br></p>
  
    <p>We look forward to being a part of your challenging, miraculous , creative, life.<br><br></p>
  
    <p>Best regards,<br/>
    Your Zodiaccurate Team<br></p>
  
    <p>You can change your CC information or cancel anytime via this <a href="${stripeLink}">Link</a></p>
    <p>If you have any questions, please contact us at support@zodiaccurate.com</p>
  `;

    var aliases = GmailApp.getAliases()
    Logger.log(aliases[0]);

    GmailApp.sendEmail(email, subject, "", {
      htmlBody: message,
      from: aliases[0] 
    });
}

function sendHoroscopeEmail() {
    //Pull day from firebase
    const horoscope = pullHoroscopeFromFirebase(TEST_USER);

            console.log("RESPONSE DATA: " + JSON.stringify(horoscope));

            var responseData = createHoroscopeJsonForEmail(JSON.stringify(horoscope));

            // Check if jsonModel is a valid JSON object and save/send it if it is
            if (responseData != null) {
                //Parse data
                console.log("SE-Sending Horoscope Email: " + horoscope);
                var horoscopeModel = parseHoroscopeResponse(horoscope);

                var imageUrl = headerLogo;
                var headerImageBlob = UrlFetchApp.fetch(imageUrl).getBlob();

                var inlineImage = {
                    fileName: 'zodiac_header.png',
                    content: headerImageBlob,
                    mimeType: 'image/png',
                    contentId: 'zodiac_header'
                };

                // Define the HTML body of the email with dynamic content from horoscope JSON
                var htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header img {
                width: 100%;
                height: auto;
                border-radius: 8px 8px 0 0;
                display: block;
            }
            .content {
                padding: 20px;
            }
            h2 {
                color: #2e6ca8;
                margin-bottom: 10px;
            }
            p {
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 20px;
            }
            .footer {
                text-align: center;
                padding: 20px;
                background-color: #f4f4f4;
                color: #777;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="cid:zodiac_header" alt="Zodiaccurate Daily Guidance">
            </div>
            <div class="content">
              <h3>${getDate()}</h3>

            ${horoscopeModel["Overview"]?.content || horoscopeModel["Overview"] || horoscopeModel["GeneralOverview"]?.content || horoscopeModel["GeneralOverview"] || horoscopeModel["GeneralOutlook"]?.content || horoscopeModel["GeneralOutlook"] ? `
              <h2>Overview</h2>
              <p>${horoscopeModel["Overview"]?.content || horoscopeModel["Overview"] || ' '}</p>
              <p>${horoscopeModel["GeneralOverview"]?.content || horoscopeModel["GeneralOverview"] || ' '}</p>
              <p>${horoscopeModel["GeneralOutlook"]?.content || horoscopeModel["GeneralOutlook"] || ' '}</p>
             ` : ''}

            ${horoscopeModel["PersonalGuidance"]?.content || horoscopeModel["PersonalGuidance"] ? `
              <h2>Personal Guidance</h2>
              <p>${horoscopeModel["PersonalGuidance"]?.content || horoscopeModel["PersonalGuidance"]}</p>
              ` : ''}

            ${horoscopeModel["Relationships"]?.content || horoscopeModel["Relationships"] || horoscopeModel["FamilyAndRelationships"]?.content || horoscopeModel["FamilyAndRelationships"] ? `
              <h2>Relationships</h2>
              <p>${horoscopeModel["Relationships"]?.content || horoscopeModel["Relationships"] || ' '}</p>
              <p>${horoscopeModel["FamilyAndRelationships"]?.content || horoscopeModel["FamilyAndRelationships"] || ' '}</p>
             ` : ''}

            ${horoscopeModel["CareerAndFinances"]?.content || horoscopeModel["CareerAndFinances"] ? `
              <h2>Career and Finances</h2>
              <p>${horoscopeModel["CareerAndFinances"]?.content || horoscopeModel["CareerAndFinances"]}</p>
              ` : ''}

            ${horoscopeModel["ParentingGuidance"]?.content || horoscopeModel["ParentingGuidance"] ? `
              <h2>Parenting Guidance</h2>
              <p>${horoscopeModel["ParentingGuidance"]?.content || horoscopeModel["ParentingGuidance"]}</p>
              ` : ''}

            ${horoscopeModel["Health"]?.content || horoscopeModel["Health"] || horoscopeModel["HealthAndWellness"]?.content || horoscopeModel["HealthAndWellness"] || horoscopeModel["EmotionalAndMentalWellBeing"]?.content || horoscopeModel["EmotionalAndMentalWellBeing"] ? `
              <h2>Health</h2>
              <p>${horoscopeModel["Health"]?.content || horoscopeModel["Health"] || ' '}</p>
              <p>${horoscopeModel["HealthAndWellness"]?.content || horoscopeModel["HealthAndWellness"] || ' '}</p>
              <p>${horoscopeModel["EmotionalAndMentalWellBeing"]?.content || horoscopeModel["EmotionalAndMentalWellBeing"] || ' '}</p>
             ` : ''}

            ${horoscopeModel["PracticalTips"]?.content || horoscopeModel["PracticalTips"] ? `
              <h2>Practical Tips</h2>
              <p>${horoscopeModel["PracticalTips"]?.content || horoscopeModel["PracticalTips"]}</p>
              ` : ''}

            ${horoscopeModel["LocalWeather"]?.content || horoscopeModel["LocalWeather"] ? `
              <h2>Local Weather</h2>
              <p>${horoscopeModel["LocalWeather"]?.content || horoscopeModel["LocalWeather"]}</p>
          </div>
            ` : ''}

            <div class="footer">
                <p>&copy; 2024 Zodiaccurate. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

                console.log("HTML EMAIL");
                console.log(htmlBody);

                var maxSize = 20000; // Maximum allowed size for email body

                // Check if the content exceeds the size limit
                if (htmlBody.length > maxSize) {
                    console.log("Content size exceeds limit. Trimming the content.");
                    htmlBody = htmlBody.substring(0, maxSize - 100) + "\n\n[Content trimmed due to size limits]";
                }

                var aliases = GmailApp.getAliases();

                // Send the email with inline images
                GmailApp.sendEmail("casspangell@gmail.com", "Zodiaccurate Daily Guidance", "", {
                    htmlBody: htmlBody,
                    from: aliases[0],
                    cc: "dahnworldhealer@yahoo.com",
                    inlineImages: {
                        zodiac_header: inlineImage.content
                    }
                });

            }

}


  


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

function sendHoroscopeEmail(horoscope, email) {
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
              <h3>${getDate}</h3>
              <h2>Overview</h2>
              <p>${horoscopeModel.Overview?.content || horoscopeModel.Overview || 'No overview available'}</p>

              <h2>Personal Guidance</h2>
              <p>${horoscopeModel.PersonalGuidance?.content || horoscopeModel.PersonalGuidance || 'No personal guidance available'}</p>

              <h2>Relationships</h2>
              <p>${horoscopeModel.Relationships?.content || horoscopeModel.Relationships || 'No relationships information available'}</p>

              <h2>Career and Finances</h2>
              <p>${horoscopeModel.CareerAndFinances?.content || horoscopeModel.CareerAndFinances || 'No career and finances information available'}</p>

              <h2>Parenting Guidance</h2>
              <p>${horoscopeModel.ParentingGuidance?.content || horoscopeModel.ParentingGuidance || 'No parenting guidance available'}</p>

              <h2>Health</h2>
              <p>${horoscopeModel.Health?.content || horoscopeModel.Health || 'No health information available'}</p>

              <h2>Local Weather</h2>
              <p>${horoscopeModel.LocalWeather?.content || horoscopeModel.LocalWeather || 'No local weather information available'}</p>
          </div>


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
    GmailApp.sendEmail(email, "Zodiaccurate Daily Guidance", "", {
        htmlBody: htmlBody,
        from: aliases[0],
        inlineImages: {
            zodiac_header: inlineImage.content
        }
    });
}


  


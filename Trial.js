function scheduleTrialEndingReminder(email, firstName) {
  var now = new Date();
  var reminderDate = new Date(now);
  reminderDate.setDate(now.getDate() + 7); // Schedule the reminder email 7 days after the initial sign-up

  Logger.log('Scheduling trial ending reminder for:', email, 'Reminder Date:', reminderDate); // Debugging information
  ScriptApp.newTrigger('sendTrialEndingReminder')
    .timeBased()
    .at(reminderDate)
    .create();

  var properties = {
    email: email,
    firstName: firstName
  };
  PropertiesService.getScriptProperties().setProperties(properties);
}

function sendTrialEndingReminder() {
  var properties = PropertiesService.getScriptProperties().getProperties();
  var email = properties.email;
  var firstName = properties.firstName;
  var subject = "Don't miss out—Only 3 days left of your free Zodiaccurate trial!";
  Logger.log('Sending trial ending reminder to:', email); // Debugging information
  var message = `Hi ${firstName},

We hope you've enjoyed your first week with Zodiaccurate! We wanted to remind you that your free trial is ending soon—only 3 days left to enjoy the full benefits of our daily guidance.

This priceless program is only $9.99 for a WHOLE MONTH of guidance, and if you're not completely satisfied, you can cancel anytime. (link at the bottom of every daily guidance email)

To continue receiving personalized astrological insights that help guide your daily decisions, make sure to subscribe now.

Best regards,  
Your Zodiaccurate Team`;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: message,
    from: 'dailyguidance@zodiaccurate.com',
    noReply: true
  });
}

var fs = require('fs');
var readline = require('readline');
var defaultMailTemplate = require('./defaultMailTemplate.js');

//================== SUPPORTING FUNCTIONS =========================

var mailProvider = function (transporter) {

  if(!transporter || transporter === null)
    throw new exception("No transporter passed to mail provider!");

  var module = {};

  module.sendDefaultContactMail = function(message, onSuccess, onError) {
    this.sendMail(message, transporter, defaultMailTemplate, onSuccess, onError);
  }

  module.sendMail = function(message, template, onSuccess, onError) {

    var hasTemplate = template && template != null && template.length > 0;

    var templateContents = template === defaultMailTemplate ? defaultMailTemplate : null;

    var sendTheMail = function() {

      console.log(message);

      message.mailBody = message.mailBody.replace(/(?:\r\n|\r|\n)/g, '<br />');
      
      var plaintext = `
        Submitted Information:
        Name: ${message.firstName} ${message.lastName}
        Email: ${message.from}
        Comment:
        ${message.mailBody}
      `;

     var htmlContent = plaintext;

      if(templateContents != null) {
        htmlContent = templateContents.replace("$%$%NAME_PLACEHOLDER$%$%", message.firstName + " " + message.lastName);
        htmlContent = htmlContent.split("$%$%EMAIL_PLACEHOLDER$%$%").join(message.from);
        htmlContent = htmlContent.replace("$%$%COMMENT_PLACEHOLDER$%$%", message.mailBody);
      }

      // setup e-mail data with unicode symbols
      var mail = {
        from: message.from, // sender address
        to: message.to, // list of receivers
        subject: message.subject, // Subject line
        text: plaintext, // plaintext body
        html: htmlContent // html body
      };

      //console.log(mail);
      //console.log('sending mail: ' + mail.from + ' '+ mail.to + ' '+ mail.subject + ' '+ mail.text + ' ');

      // send mail with defined transport object
      
      transporter.sendMail(mail, function(error, info){
        if(error){
          onError && onError();
          return console.log(error);
        }
        onSuccess && onSuccess("Email sent succesfully!");
        console.log('Message sent: ' + info.response);
      });
      
    }

    if(hasTemplate && template !== defaultMailTemplate) {
      fs.readFile(template, "utf8", function (err, content) {
        if(err){
          console.log(err);
          onError(err);
          return;
        }

        templateContents = content;
        sendTheMail();
      });
    } else
      sendTheMail();

  }



  return module;
}

module.exports = mailProvider;

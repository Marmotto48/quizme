const AWS = require("aws-sdk");

const SES_CONFIG = {
  accessKeyId: "AKIA4U4HBXTYMJBNOJHH",
  secretAccessKey: "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",
  region: "eu-west-3",
};

const AWS_SES = new AWS.SES(SES_CONFIG);

let verifyEmail = (recipientEmail, confirmationLink, name) => {
  console.log("here", confirmationLink)
  let params = {
    Source: "no-reply@quizme.io",
    Destination: {
      ToAddresses: [recipientEmail],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: ``,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Vérification de l'adresse e-mail `,
      },
    },
  };
  return AWS_SES.sendEmail(params).promise();
};

let sendTemplateEmail = (recipientEmail) => {
  let params = {
    Source: "<email address you verified>",
    Template: "<name of your template>",
    Destination: {
      ToAddresse: ["samy@evadam.io"],
    },
    TemplateData: "{ \"name':'John Doe'}",
  };
  return AWS_SES.sendTemplatedEmail(params).promise();
};

module.exports = {
  verifyEmail,
  sendTemplateEmail,
};

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_PASSWORD);

interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;

}

const sendEmail = async (mailOptions: EmailPayload): Promise<any> => {
  try {
    await sgMail.send(mailOptions);
    return { status: true, message: "data updated" };
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
      return { status: false, message: error.response.body };
    }
    return { status: false, result: error };
  }
};

export default sendEmail;

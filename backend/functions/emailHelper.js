import axios from 'axios';

export const sendPasswordResetOTPEmail = async(receiverEmail, receiverName, otp) =>{
    try {
    const response = await axios.post(
      process.env.BREVO_EMAIL_API_ENDPOINT,
      {
        sender: { email: process.env.SENDER_EMAIL_ID , name: 'Sikad App' },
        to: [{ email: receiverEmail, name: receiverName }],
        subject: 'Sikad Password Reset verification OTP',
        htmlContent: `Your Sikad Password Reset OTP code is '${otp}'. The code is valid for 5 minutes. Please verify your account using this code to reset your password.`
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error sending email: ', error.response?.data || error.message);
  }

}

export const sendNewPasswordEmail = async(receiverEmail, receiverName) =>{
    try {
    const response = await axios.post(
      process.env.BREVO_EMAIL_API_ENDPOINT,
      {
        sender: { email: process.env.SENDER_EMAIL_ID , name: 'Sikad App' },
        to: [{ email: receiverEmail, name: receiverName }],
        subject: "Welcome to Sikad App",
        htmlContent: `Welcome to Sikad App. You have successfully registered your account with email: `+receiverEmail+"\n\nThank you."
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error sending email: ', error.response?.data || error.message);
  }

}
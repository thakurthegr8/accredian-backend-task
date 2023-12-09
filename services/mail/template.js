const userTokenVerification = ({ to_name, email, message }) => {
  return {
    from_name: "Accredian-auth",
    to_name,
    message,
    reply_to: email,
  };
};

module.exports = userTokenVerification;

exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "OAuth2 callback working!" }),
  };
};
const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;
  const state = event.queryStringParameters.state;

  if (!code) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      scope: "repo",
      state: Math.random().toString(36).substring(7),
    });
    return {
      statusCode: 302,
      headers: {
        Location: `https://github.com/login/oauth/authorize?${params}`,
      },
    };
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  const token = data.access_token;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: `<script>
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token, provider: "github" })}',
        '*'
      );
    </script>`,
  };
};

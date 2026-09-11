export default async function getRefreshToken(
  refreshToken: string,
  accountId: string,
  type?: "SIGNIN" | "REFRESH",
  path?: string
) {
  try {
    const result = await fetch(
      (process.env.VITE_USERHUB_ENDPOINT
        ? process.env.VITE_USERHUB_ENDPOINT
        : path) + "/session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "REFRESH_TOKEN",
          previousRefreshToken: refreshToken,
          accountId,
          type: type ?? "SIGNIN",
        }),
      }
    ).then((res) => res.json());
    if (result && result.code == "REFRESH_TOKEN_REQUEST_SUCCESSFUL") {
      return { ...result.body };
    } else {
      console.log("ASDLKJADSD::::", JSON.stringify(result));
      return null;
    }
  } catch (error: any) {
    console.log("ASDLKJADSD::::", error);

    return null;
  }
}

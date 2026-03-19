export const getSessionId = (cookies: string[]) => {
  return (
    cookies[0]
      ?.split(";")
      .filter((positions) => {
        return positions.includes("id=");
      })[0]
      ?.split("=") || []
  );
};

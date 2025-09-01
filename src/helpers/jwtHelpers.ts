import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
  const token = (jwt as any).sign(payload, secret, { expiresIn });
  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  const tokenWithoutQuotes = token.replace(/^"|"$/g, "");

  const verifiedUser = jwt.verify(
    tokenWithoutQuotes,
    secret as any
  ) as JwtPayload;

  return verifiedUser;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};

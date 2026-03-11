import { resolveMx } from "node:dns/promises";

/**
 * Verifies that the email domain has at least one MX record,
 * meaning it is a real domain capable of receiving email.
 * Throws a 422 error if the domain is invalid or unreachable.
 */
export async function validateEmailDomain(email: string): Promise<void> {
  const domain = email.split("@")[1];

  try {
    const records = await resolveMx(domain);
    if (!records || records.length === 0) {
      throw {
        statusCode: 422,
        message: "Email domain does not exist or cannot receive emails",
      };
    }
  } catch (err: unknown) {
    const asHttpError = err as { statusCode?: number };
    if (asHttpError.statusCode) throw err;

    // DNS lookup failure (ENOTFOUND, ENODATA, etc.) → domain does not exist
    throw {
      statusCode: 422,
      message: "Email domain does not exist or cannot receive emails",
    };
  }
}

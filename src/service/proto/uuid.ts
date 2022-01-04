import uuidParse from "uuid-parse";

/**
 * Convert a Uint8Array of length 16 to a UUID string.
 *
 * @throws Error
 *      if the input given is not of length 16
 * @param idArray
 */
export function toUuidString(idArray: Uint8Array): string {
  if (idArray.length !== 16) {
    throw new Error("idArray is expected to have length 16 " + idArray);
  }
  return uuidParse.unparse(Buffer.from(idArray));
}

/**
 * Convert a UUID string to a Uint8Array representation.
 * There is no check for whether uuidString is a valid UUID string.
 *
 * @param uuidString
 */
export function fromUuidString(uuidString: string): Uint8Array {
  return new Uint8Array(uuidParse.parse(uuidString));
}

export function toStringFromArray(stringArray: Uint8Array): string {
  return new TextDecoder("utf-8").decode(stringArray);
}

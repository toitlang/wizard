// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import sha256 from "fast-sha256";

export function injectConfig(partition: Uint8Array, config: Uint8Array, uniqueID: Uint8Array): Uint8Array {
  const [imageDataOffset, imageDataSize] = getImageDataPosition(partition);
  const imageConfigSize = imageDataSize - uniqueID.length;

  // We need to regenerate the checksums for the image. Checksum format is described here:
  // https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/system/app_image_format.html

  // NOTE this will not work if we enable CONFIG_SECURE_SIGNED_APPS_NO_SECURE_BOOT or CONFIG_SECURE_BOOT_ENABLED

  let hashAppend = partition[23] == 1;

  let xorCSOffset = partition.length - 1;
  if (hashAppend) {
    xorCSOffset = partition.length - 1 - 32;
  }

  for (let i = imageDataOffset; i < imageDataOffset + imageDataSize; i++) {
    partition[xorCSOffset] ^= partition[i];
  }

  if (config.length > imageConfigSize) {
    throw "data too big to inline into binary";
  }

  partition.fill(0, imageDataOffset, imageDataOffset + imageDataSize); // Zero out area.
  partition.set(config, imageDataOffset);
  partition.set(uniqueID, imageDataOffset + imageConfigSize);

  for (let i = imageDataOffset; i < imageDataOffset + imageDataSize; i++) {
    partition[xorCSOffset] ^= partition[i]
  }

  if (hashAppend) {
    const boundary = partition.length - 32;
    const hash = sha256(partition.subarray(0, boundary));
    partition.set(hash, boundary);
  }

  return partition
}


// These two are the current offsets of the config data in the system image.
// We could auto-detect them from the bin file, but they are only used files
// from the current SDK so there's no need.
const IMAGE_DATA_SIZE = 1024;
const IMAGE_DATA_OFFSET = 296;

// This is the offset in old SDKs where there are no magic numbers marking
// the location of the offset data
const LEGACY_IMAGE_DATA_SIZE = 1024;
const LEGACY_IMAGE_DATA_OFFSET = 69888;

const IMAGE_DATA_MAGIC_1 = 0x7017da7a;
const IMAGE_DATA_MAGIC_2 = 0xc09f19;

function getImageDataPosition(bytes: Uint8Array): [number, number] {
  const asWords = Uint32Array.from(bytes);
  const WORD_SIZE = 4;
  for (let i = 0; i < asWords.length; i++) {
    const word_1 = asWords[i];
    if (word_1 == IMAGE_DATA_MAGIC_1) {
      // Search for the end at the (0.5k + word_size) position and at
      // subsequent positions up to a data area of 4k.  We only search at these
      // round numbers in order to reduce the chance of false positives.
      for (let j = 0x80 + 1; j <= 0x400 + 1 && i + j < asWords.length; j += 0x80) {
        let word_2 = asWords[i + j];
        if (word_2 == IMAGE_DATA_MAGIC_2) {
          return [(i + 1) * WORD_SIZE, (j - 1) * WORD_SIZE]
        }
      }
    }
  }
  // No magic numbers were found so the image is from a legacy SDK that has the
  // image data at a fixed offset.
  return [LEGACY_IMAGE_DATA_OFFSET, LEGACY_IMAGE_DATA_SIZE]
}

import {
  Cloneable,
  LeadTypes,
  OrganizationLocalizationType,
  PathKeysForSubscription,
  PathsKeyForPermission,
  UserHubDataTypes,
} from "@/types";
import * as CryptoTS from "crypto-ts";
import NumberToWords from "number-to-words";
import { NotificationDataTypes } from "@/features/components/notification/notificationDataTypes";
import {
  PushNotificationModule,
  PushNotificationSubModule,
  PushNotificationType,
} from "@/features/constants/constant";
import { countries } from "@/features/constants/countries";
import axios from "axios";
import moment, { Duration } from "moment";
import momentTz from "moment-timezone";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import Resizer from "react-image-file-resizer";
import { roundNumber } from "@/utils/numbers";
import { envConfig } from "@/config/env";

// Public lead-capture app: stub admin-only product/invoice/session types
type InvoiceData = Record<string, unknown>;
type ProductType = Record<string, unknown>;

export const parseJwt = async (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const buff = Buffer.from(base64, "base64");
  const payloadinit = buff.toString("utf8"); // Change "ascii" to "utf8"
  const payload = JSON.parse(payloadinit);
  return payload;
};

export const formatDuration = (duration: Duration) => {
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  // Use String.padStart() to ensure the output is always two digits
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};

export function splitName(input: string): string[] {
  const spaceIndex = input.indexOf(" ");
  if (spaceIndex !== -1) {
    const firstPart = input.slice(0, spaceIndex);
    const secondPart = input.slice(spaceIndex + 1);
    return [firstPart, secondPart];
  }
  return [input];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function encryptAES(text: any, secretKey: any) {
  const secret = Buffer.from(secretKey, "base64").toString();
  const ciphertext = CryptoTS.AES.encrypt(text, secret).toString();
  return ciphertext;
}

export function decryptAES(encryptedText: any, secretKey: any) {
  if (!encryptedText || !secretKey) {
    return "";
  }
  const secret = Buffer.from(secretKey, "base64").toString();
  if (!secret) {
    return "";
  }
  const bytes = CryptoTS.AES.decrypt(encryptedText, secret);
  const decrypted = bytes.toString(CryptoTS.enc.Utf8);
  return decrypted;
}

//format date string to DD/MM/YYYY
export const formatDate = (timestampString: string): string => {
  const timestamp: number = parseInt(timestampString, 10);
  const date: Date = new Date(timestamp);

  const day: string = String(date.getDate()).padStart(2, "0");
  const month: string = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year: number = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const suffixOfNumber = (num: number) => {
  const suffixes = ["st", "nd", "rd", "th"];
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return suffixes[3];
  }
  return suffixes[lastDigit - 1] || suffixes[3];
};

export const readexcelAndReturnLeads = async (file: Blob) => {
  const reader = new FileReader();
  reader.readAsBinaryString(file);
  const value = await new Promise((resolve, reject) => {
    reader.onload = (event) => {
      const data = event.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        // Transform the raw data into the desired format (Lead interface)
        const transformedData: LeadTypes[] = rawData.map((row: any) => {
          const mobile = row?.mobile ? String(row.mobile).trim() : "";

          return {
            leadName: row?.["lead name"] ?? row?.["client name"],
            leadEmail: row?.email ? String(row.email).trim() : "",
            leadMobile: mobile
              ? mobile.startsWith("+")
                ? mobile
                : `+${mobile}`
              : "",
            leadAddress: row?.address,
            leadCity: row?.city,
            leadState: row?.state,
            leadCountry: row?.country,
            leadZipcode: row?.zipcode?.toString(), // Convert to string
            projectSource: row?.source,
            projectType:
              row?.["project type"] && row["project type"] !== "undefined"
                ? String(row["project type"]).trim()
                : "",
            projectArea: row?.["project area"] ?? 0,
            projectLocation: row?.location,
            projectStatus: "New",
            projectName: row?.["project name"],
            projectBudget: row?.["project budget"],
          };
        });
        resolve(transformedData);
        return transformedData;
      } else {
        reject("Target unknown");
      }
    };
  });
  return value;
};

export const readexcelAndReturnBOQ = async (file: Blob) => {
  const NOT_ALLOWED_UNITS = [
    "nos",
    "acre",
    "ha",
    "l",
    "qt",
    "ml",
    "mg",
    "pt",
    "g",
    "gal",
    "fl oz",
    "tonne",
    "oz",
    "lb",
    "imperial ton",
    "stone",
    "us ton",
    "kg",
    "set",
  ];

  const reader = new FileReader();
  reader.readAsBinaryString(file);

  const value = await new Promise((resolve, reject) => {
    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data)
        return reject({
          code: "noData",
          message: "No data found in the uploaded Excel file.",
        });

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const filteredData = rawData.filter((row: any, index: number) => {
          if (!row?.["Type"] || row["Type"].toString().trim() === "") {
            // console.warn(`Skipping row ${index + 2} because Type is missing`, row);
            return false; // filter out
          }
          return true;
        });

        // Transform raw data
        const transformedData = filteredData.map((row: any, index: number) => {
          const unit = row?.["Unit"]?.toString().toLowerCase() ?? "";

          // if (row["Type"] === "BOQ Item" && unit) {
          //   throw { code: "invalidUnit", row: index + 2, unit: row["Unit"] };
          // }

          return {
            SR: row?.["SR"] ?? "",
            type: row?.["Type"] ?? "",
            name: row?.["Name"] ?? "",
            description: row?.["Description"] ?? "",
            unit,
            quantity: Number(row?.["Quantity"] ?? 0),
            rate: Number(row?.["Rate"] ?? 0),
            amount: Number(row?.["Amount"] ?? 0),
          };
        });

        const result: any[] = [];
        let currentSection: any = null;
        let currentBoqItem: any = null;

        transformedData.forEach((item, index) => {
          switch (item.type) {
            case "Section":
              currentSection = { section: item.name, boqitem: [] };
              result.push(currentSection);
              currentBoqItem = null;
              break;

            case "BOQ Item":
              if (!currentSection) {
                throw {
                  code: "noSectionBoqItem",
                  row: index + 2,
                  itemName: item.name,
                };
              }
              currentBoqItem = {
                boqitemname: item.name,
                boqlineitem: [],
                description: item.description,
                type: item.type,
                unit:
                  item.unit.toLowerCase() === "nos"
                    ? "Nos"
                    : item.unit.toLowerCase(),
                quantity: item.quantity,
                rate: item.rate,
                amount: roundNumber(item.quantity * item.rate) || item.amount,
              };
              currentSection.boqitem.push(currentBoqItem);
              break;

            case "BOQ Line Item":
              if (!currentSection) {
                throw {
                  code: "noSectionBoqLineItem",
                  row: index + 2,
                  itemName: item.name,
                };
              }
              if (!currentBoqItem) {
                currentSection.boqitem.push({
                  boqitemname: item.name,
                  boqlineitem: [
                    {
                      SR: item.SR,
                      name: item.name,
                      description: item.description,
                      unit:
                        item.unit.toLowerCase() === "nos"
                          ? "Nos"
                          : item.unit.toLowerCase(),
                      quantity: item.quantity,
                      rate: item.rate,
                      amount:
                        roundNumber(item.quantity * item.rate) || item.amount,
                    },
                  ],
                  type: "Individual Item",
                });
              } else {
                currentBoqItem.boqlineitem.push({
                  SR: item.SR,
                  name: item.name,
                  description: item.description,
                  unit:
                    item.unit.toLowerCase() === "nos"
                      ? "Nos"
                      : item.unit.toLowerCase(),
                  quantity: item.quantity,
                  rate: item.rate,
                  amount: roundNumber(item.quantity * item.rate) || item.amount,
                });
              }
              break;

            case "Individual Item":
              if (!currentSection) {
                throw {
                  code: "noSectionIndividualItem",
                  row: index + 2,
                  itemName: item.name,
                };
              }
              currentSection.boqitem.push({
                boqitemname: item.name,
                boqlineitem: [
                  {
                    SR: item.SR,
                    name: item.name,
                    description: item.description,
                    unit:
                      item.unit.toLowerCase() === "nos"
                        ? "Nos"
                        : item.unit.toLowerCase(),
                    quantity: item.quantity,
                    rate: item.rate,
                    amount:
                      roundNumber(item.quantity * item.rate) || item.amount,
                  },
                ],
                type: item.type,
              });
              break;

            default:
              throw { code: "unknownType", row: index + 2, type: item.type };
          }
        });

        if (result.length === 0) {
          throw { code: "sectionnotfound" };
        }

        resolve(result);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject({ code: "readError", error });
  });

  return value;
};

/**
 * Processes amount string by removing commas and validating it's a number.
 * Returns the number if valid, otherwise an empty string.
 */
export const validateAndFormatAmount = (amount: any): number | string => {
  if (amount === undefined || amount === null || amount === "") return "";
  const cleanAmount = amount.toString().replace(/,/g, "");
  const num = Number(cleanAmount);
  return isNaN(num) ? "" : Number(num.toFixed(2));
};

export const validateAndFormatOptionalNumber = (
  value: any,
): number | string => {
  if (value === undefined || value === null || value === "") return "";
  const cleanValue = value.toString().replace(/,/g, "");
  const num = Number(cleanValue);
  return isNaN(num) ? "" : num;
};

/**
 * Validates and converts a date string (DD/MM/YYYY) to a timestamp.
 * Returns the timestamp as a number if valid, otherwise an empty string.
 */
export const validateAndFormatDate = (dateStr: any): number | string => {
  if (!dateStr) return "";

  let dateObj;

  // Handle Excel serial numbers (number of days since Dec 30, 1899)
  if (typeof dateStr === "number") {
    dateObj = moment.utc((dateStr - 25569) * 86400 * 1000);
  } else {
    // Try multiple formats to be robust (image shows MM/DD/YYYY, but user requested DD/MM/YYYY)
    const formats = ["MM/DD/YYYY"];
    dateObj = moment.utc(dateStr, formats, true);
  }

  if (dateObj.isValid()) {
    const year = dateObj.year();
    // Reasonable range check (e.g., between 2000 and 2100)
    // This catches outliers like 1905 or 2231 seen in the Excel sheet
    if (year < 2000 || year > 2100) {
      return "";
    }

    return dateObj.valueOf();
  }
  return "";
};

export const readexcelAndReturnExpense = async (file: Blob) => {
  const reader = new FileReader();
  reader.readAsBinaryString(file);

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) {
        reject("No data found in file");
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const transformedData = rawData
          .filter((row: any) => row?.["Name*"] || row?.["Amount*"])
          .map((row: any) => ({
            name: row?.["Name*"] ?? "",
            totalAmount: validateAndFormatAmount(row?.["Amount*"]),
            quantity: validateAndFormatOptionalNumber(row?.["Quantity"]),
            unit: row?.["Unit"]?.toString().trim() ?? "",
            dueDate: validateAndFormatDate(row?.["Date*"]),
            modeOfPayment:
              row?.["Mode of Payment (MOP)*"]?.toString().toUpperCase() ??
              "CASH",
            status:
              row?.["Payment Status"]?.toString().toUpperCase() === "PAID"
                ? "PAID"
                : "UNPAID",
            workCategory: row?.["Work Category"] ?? "",
            description: row?.["Description"] ?? "",
          }));

        resolve(transformedData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export const readexcelAndReturnProducts = async (file: Blob) => {
  const reader = new FileReader();
  reader.readAsBinaryString(file);

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) {
        reject("No data found in file");
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        // Process data in chunks to avoid memory issues
        const chunkSize = 100; // Process 100 products at a time
        const transformedData = [];

        for (let i = 0; i < rawData.length; i += chunkSize) {
          const chunk = rawData.slice(i, i + chunkSize);
          const transformedChunk = chunk
            .filter(
              (row: any) =>
                row?.["Product Name"] &&
                row?.["Product Category"] &&
                row?.["Sub-Category"],
            )
            .map((row: any) => ({
              productName: row?.["Product Name"],
              productCategory: row?.["Product Category"],
              productSubCategory: row?.["Sub-Category"],
              productBrand: row?.Brand,
              isTaxApplicable: false,
              productQuantity: row?.["Product Quantity"] ?? 1,
              unitCost: row?.["Unit Cost"] ?? 0,
              productImages: "[]",
              markup: row?.["Mark-up"] ?? 0,
              sellingPrice: calculateSellingPrice(
                row?.["Mark-up"],
                row?.["Unit Cost"],
              ),
            }));

          transformedData.push(...transformedChunk);
        }

        resolve(transformedData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

// Helper function to calculate selling price
const calculateSellingPrice = (markup: number, unitCost: number): number => {
  const cost = Number(unitCost) || 0;
  const markupValue = Number(markup) || 0;

  if (markupValue) {
    return (markupValue / 100) * cost + cost;
  }
  return cost;
};

//json Parse

export const jsonParse = (value: any) => {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error: any) {
    return value;
  }
};

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export const formatSeedValues = (text: string) => {
  const splittedText = text?.split("_");
  return splittedText?.map((val) => capitalizeFirstLetter(val))?.join(" ");
};
export function isFormattedValue(value: string): boolean {
  const formatRegex = /^[A-Z_]+$/;
  return formatRegex.test(value);
}
export const formatToCamelCaseWithAmpersand = (text: string) => {
  if (typeof text !== "string") return text;
  const words = text?.trim()?.split(/[\s_-]+/);

  return words
    ?.map((word, index, arr) => {
      if (word === "&") {
        return (
          "&" +
          (arr[index + 1]
            ? arr[index + 1].charAt(0).toUpperCase() +
            arr[index + 1].slice(1).toLowerCase()
            : "")
        );
      }
      if (index > 0 && arr[index - 1] === "&") {
        return "";
      }
      return index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
};

export const unFormatSeedValues = (text: string) => {
  return text.toUpperCase().replace(/ /g, "_");
};

export const formatError = (data: any) => {
  return data?.error ? (data?.error?.message ?? data?.error) : data.code;
};

export const checkPermissionForSubscription = (
  modules: string[],
  key: string,
) => {
  return modules?.some((val) => {
    const result = val.toLowerCase().trim().includes(key.trim().toLowerCase());
    return result;
  });
};

/** Billing may still expose Localization separately; preference hub routes accept either. */
export const hasPreferencesOrLegacyLocalizationSubscription = (
  planModules: string[] | null | undefined,
): boolean => {
  if (!planModules?.length) {
    return false;
  }
  return (
    checkPermissionForSubscription(
      planModules,
      PathKeysForSubscription.PREFERENCES,
    ) ||
    checkPermissionForSubscription(
      planModules,
      PathKeysForSubscription.LOCALIZATION,
    )
  );
};



export { formatPathname } from "@/lib/formatPathname";

export const getRequestFormData = (requestObj: any) => {
  const formData = new FormData();

  const appendToFormData = (key: string, value: any) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        appendToFormData(`${key}[${index}]`, item);
      });
    } else if (typeof value === "object" && !(value instanceof File)) {
      Object.keys(value).forEach((subKey) => {
        appendToFormData(`${key}[${subKey}]`, value[subKey]);
      });
    } else {
      formData.append(key, value);
    }
  };

  Object.keys(requestObj).forEach((key) => {
    appendToFormData(key, requestObj[key]);
  });

  return formData;
};

export function deepClone<T extends Cloneable>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    // If obj is null, a primitive type, or already a cloned object, return it directly
    return obj;
  }

  if (obj instanceof Date) {
    // Handle Date objects
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    // Handle Array objects
    const arrCopy = obj.map((item) => deepClone(item));
    return arrCopy as unknown as T;
  }

  if (obj instanceof Function) {
    // Handle Function objects
    const functionCopy = obj.bind({});
    return functionCopy as unknown as T;
  }

  // Handle objects with properties
  const clonedObj: Partial<T> = {};
  Object.keys(obj).forEach((key) => {
    clonedObj[key as keyof T] = deepClone(obj[key]);
  });

  return clonedObj as T;
}

export const toPastTense = (word: string) => {
  if (word.endsWith("end")) {
    return word.replace("end", "ent");
  } else if (word.endsWith("e")) {
    return word + "d";
  } else {
    return word + "ed";
  }
};

export const formatLogMessageWithEventType = (text: string, count?: number) => {
  const value = formatSeedValues(text);
  const splittedValues = value.split(" ");
  return splittedValues
    .map((val, index) =>
      index == 0 ? toPastTense(val) + (count ? ` ${count}` : "") : val,
    )
    .join(" ");
};

export const handleExcelExport = (
  bodyData: any,
  fileHeaderData: string[],
  fileName: string,
  fileTitle: string,
) => {
  const wrapText = (val: any, maxLen: number = 22): any => {
    if (typeof val !== "string") return val;
    const words = val.split(" ");
    let currentLine = "";
    const lines: string[] = [];

    for (const word of words) {
      if (word.length > maxLen) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = "";
        }
        let remaining = word;
        while (remaining.length > maxLen) {
          lines.push(remaining.substring(0, maxLen));
          remaining = remaining.substring(maxLen);
        }
        currentLine = remaining;
      } else if ((currentLine + (currentLine ? " " : "") + word).length > maxLen) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? " " : "") + word;
      }
    }
    if (currentLine) {
      lines.push(currentLine.trim());
    }
    return lines.join("\n");
  };

  // Wrap text in cells to emulate wrap-text behavior in standard SheetJS
  const wrappedBodyData = bodyData.map((row: any) => {
    if (!Array.isArray(row)) return row;
    return row.map((cell) => wrapText(cell));
  });

  const ws = XLSX.utils.aoa_to_sheet([fileHeaderData, ...wrappedBodyData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, fileTitle);

  // Set fixed column width of 25 characters for all columns
  ws["!cols"] = fileHeaderData.map(() => ({ wch: 25 }));

  // Generate the Excel file
  const excelData = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

  // Convert the Excel data to a Blob
  const blob = new Blob([s2ab(excelData)], {
    type: "application/octet-stream",
  });

  // Create a link to trigger the download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.xlsx`;

  // Programmatically click the anchor element to trigger the download
  a.click();

  // Clean up: revoke the object URL
  window.URL.revokeObjectURL(url);
};

function s2ab(s: string) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

export function isUUID(str: string) {
  // Define the regular expression pattern for a UUID
  const uuidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  // Test the string against the pattern
  return uuidPattern.test(str);
}

export function isProperDateTimestamp(value: any) {
  if (value == null || value == undefined) {
    return "-";
  }
  if (isValidEpoch(value)) {
    console.log("valid epoch");

    try {
      return isNaN(new Date(parseInt(value)).getTime())
        ? value
        : moment(new Date(parseInt(value))).format("DD-MM-YY hh:mm:ss A");
    } catch (error) {
      return value;
    }
  } else {
    return value;
  }
}

function isValidEpoch(value: any): boolean {
  // Check if the value is a number or a numeric string
  if (typeof value !== "number" && typeof value !== "string") {
    return false;
  }

  const epoch = Number(value);

  // Check if the conversion resulted in a valid number and if it is finite
  if (isNaN(epoch) || !Number.isFinite(epoch)) {
    return false;
  }

  // Check if the value is an integer
  if (!Number.isInteger(epoch)) {
    return false;
  }

  // Define reasonable range for epoch timestamps
  // January 1, 2000 (00:00:00 UTC) to a date far in the future (e.g., year 3000)
  const minEpoch = 946684800000; // January 1, 2000
  const maxEpoch = 32503680000000; // January 1, 3000

  // Check if the value is within the valid range
  return epoch >= minEpoch && epoch <= maxEpoch;
}
export function isProperDateTimestampWithoutSeconds(value: any) {
  try {
    const date = new Date(parseInt(value));
    if (isNaN(date.getTime())) {
      return value;
    } else {
      return moment(date).format("DD-MM-YY hh:mm A");
    }
  } catch (error) {
    return value;
  }
}
//for dashboard widget UI
export function isOnlyTimefromDate(value: any) {
  try {
    const date = new Date(parseInt(value));
    if (isNaN(date.getTime())) {
      return value;
    } else {
      return moment(date).format("hh:mm A");
    }
  } catch (error) {
    return value;
  }
}
export function getFormattedDateOnly(value: any) {
  try {
    const date = new Date(parseInt(value));
    if (isNaN(date.getTime())) {
      return value; // Return the original value if it's not a valid date
    } else {
      return moment(date).format("DD"); // Format the date as desired
    }
  } catch (error) {
    return value; // Return the original value in case of error
  }
}
export function getDayOfWeekOnly(value: any) {
  try {
    const date = new Date(parseInt(value));
    if (isNaN(date.getTime())) {
      return value; // Return the original value if it's not a valid date
    } else {
      return moment(date).format("ddd, YYYY"); // Include the year in the output (e.g., Mon, 2024)
    }
  } catch (error) {
    return value; // Return the original value in case of error
  }
}

export function camelCaseToWordsWithCaps(inputString: string) {
  // Use a regular expression to insert a space before each uppercase letter
  const stringWithSpaces = inputString?.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Capitalize the first letter of the resulting string
  return stringWithSpaces?.charAt(0).toUpperCase() + stringWithSpaces?.slice(1);
}
export function base64ToBlob(base64String: string) {
  const binaryString = Buffer.from(base64String, "base64").toString("binary");
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: "application/octet-stream" });
}

export const questionnaireUtils = {
  getAnsweredCount: (item: any) => {
    return item?.content?.reduce((answeredCount: number, page: any) => {
      const res = page?.questions?.every((control: any) => {
        let answered;
        switch (control.controlerName) {
          case "CHECK_BOX":
          case "RADIO_BUTTON":
          case "DROPDOWN_SINGLE":
          case "DROPDOWN_MULTI":
          case "ADD_IMAGE":
            answered = control?.options?.some(
              (val: any) => val?.isSelected === true,
            );
            break;
          case "RATING_SCALE":
            answered = control?.options?.choices?.some(
              (val: any) => val?.isSelected === true,
            );
            break;
          case "SHORT_ANSWER":
          case "LONG_ANSWER":
          case "EMAIL":
          case "SLIDER_SCALE":
          case "PHONE_NUMBER":
          case "DATE_AND_TIME":
            answered = control?.value ? true : false;
            break;
          case "FILE_UPLOAD":
            answered = control?.options?.some((val: any) => !!val?.url);
            break;
          case "MATRIX_CHOICE_SINGLE":
          case "MATRIX_CHOICE_MULTI":
          case "MATRIX_RATING_SCALE":
            answered = control?.options?.rowLabel?.some((val: any) =>
              val?.columnSelected?.some((val: any) => val?.isSelected === true),
            );
            break;
          case "MATRIX_DROPDOWN":
            answered = control?.options?.rowLabel?.some((val: any) =>
              val?.columnSelected?.some((col: any) => !!col?.value),
            );
            break;
          default:
            answered = false;
            break;
        }
        return answered;
      });
      if (res) {
        answeredCount = answeredCount + 1;
      }

      return answeredCount;
    }, 0);
  },
};

export const normalizeWhatsappContent = (
  content: string | null | undefined,
): string => {
  if (content == null) return "";

  let normalized = String(content).trim();
  if (
    normalized.startsWith('"') &&
    normalized.endsWith('"') &&
    normalized.length >= 2
  ) {
    try {
      normalized = JSON.parse(normalized);
    } catch {
      // keep original if not valid JSON string
    }
  }

  return typeof normalized === "string" ? normalized.trim() : "";
};

export const fetchContentFromS3 = async (url: string) => {
  const { data }: any = await axios.post("/api/aws", {
    url,
  });

  return data?.data;
};

export const downloadFileFromS3 = async (url: string, fileName: string) => {
  try {
    const awsResp = await axios.post("/api/aws", { url, blob: true });
    const base64 = awsResp?.data?.data;
    if (!base64) throw new Error("No data returned from S3 proxy");

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName || url.split("/").pop()?.split("?")[0] || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Error downloading file via S3 proxy:", error);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


export const bindMacros = async (request: any) => {
  const { data }: any = await axios.post("/api/bind-macros", {
    ...request,
  });
  return data?.data;
};

export const secsFormat = (secs: number) => {
  const duration = moment.duration(secs, "seconds");

  if (duration.asSeconds() < 60) {
    return `${Math.floor(duration.asSeconds())} Secs`;
  } else if (duration.asSeconds() < 3600) {
    return `${Math.floor(duration.asMinutes())} Mins`;
  } else {
    return `${Math.floor(duration.asHours())} Hours`;
  }
};

export function hexToRgb(hex: any): any {
  // Return default if hex is undefined or null
  if (!hex) {
    return "25, 118, 210"; // Default Material-UI blue RGB values
  }

  // Remove '#' if present
  hex = hex.replace("#", "");

  // Validate hex string (can be 3 or 6 characters)
  if (!hex || (hex.length !== 3 && hex.length !== 6)) {
    return "25, 118, 210"; // Default Material-UI blue RGB values
  }

  // Expand 3-character hex to 6 characters (e.g., #FFF -> #FFFFFF)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char: string) => char + char)
      .join("");
  }

  // Convert hex to RGB
  const bigint = parseInt(hex, 16);

  // Check if parsing was successful
  if (isNaN(bigint)) {
    return "25, 118, 210"; // Default Material-UI blue RGB values
  }

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
}

export function getTimezoneCode(timezoneName: any) {
  return moment.tz(timezoneName).format("z");
}

export const getLocalizationValue = (
  localization: Array<OrganizationLocalizationType>,
  keyType: "CURRENCY" | "NUMBER_FORMAT" | "LANGUAGE" | "DATE" | "TIMEZONE",
  keyName:
    | "SYMBOL"
    | "TRAILING_ZERO_DISPLAY"
    | "USE_GROUPING"
    | "STYLE"
    | "SIGN_DISPLAY"
    | "ROUNDING_PRIORITY"
    | "ROUNDING_MODE"
    | "ROUNDING_INCREMENT"
    | "NUMBERING_SYSTEM"
    | "NOTATION"
    | "MINIMUM_INTEGER_DIGITS"
    | "MINIMUM_FRACTION_DIGITS"
    | "MAXIMUM_FRACTION_DIGITS"
    | "LOCALE"
    | "CODE"
    | "FORMAT"
    | "ID",
) => {
  let newArr = localization?.map((value) => {
    if (value.keyName == keyName && value.keyType == keyType) {
      return value.value;
    } else {
      return null;
    }
  });
  newArr = newArr.filter((val) => val !== null);

  return newArr?.[0];
};

type FormatNumberITLOptions = {
  isCurrency?: boolean;
};

export const formatNumberITL = (
  localization?: Array<OrganizationLocalizationType>,
  value: string | number = 0,
  options: FormatNumberITLOptions = {},
) => {
  const { isCurrency = false } = options;
  if (localization) {
    const convertedValue = isNaN(parseFloat(value?.toString()))
      ? 0
      : parseFloat(value.toString());

    const userLanguage = getLocalizationValue(localization, "LANGUAGE", "CODE");
    const currencySymbol =
      getLocalizationValue(localization, "CURRENCY", "SYMBOL") ??
      getLocalizationValue(localization, "CURRENCY", "CODE") ??
      "";

    const keys = [
      "TRAILING_ZERO_DISPLAY",
      "USE_GROUPING",
      "STYLE",
      "SIGN_DISPLAY",
      "ROUNDING_PRIORITY",
      "ROUNDING_MODE",
      "ROUNDING_INCREMENT",
      "NUMBERING_SYSTEM",
      "NOTATION",
      "MINIMUM_INTEGER_DIGITS",
      "MINIMUM_FRACTION_DIGITS",
      "MAXIMUM_FRACTION_DIGITS",
      "LOCALE",
    ];

    const obj: any = {};
    keys?.map((value) => {
      const res = getLocalizationValue(
        localization,
        "NUMBER_FORMAT",
        value as any,
      );
      if (res) {
        obj[formatNumberSystemKeys(value)] = res;
      }
    });

    if (userLanguage) {
      const isDecimal =
        value?.toString()?.includes(".") || value?.toString()?.includes(",");

      const formattedNumber = new Intl.NumberFormat(obj.locale, {
        ...obj,
        ...(isDecimal
          ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          : { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      }).format(convertedValue);

      if (isCurrency) {
        return currencySymbol
          ? `${currencySymbol} ${formattedNumber}`
          : formattedNumber;
      }

      return formattedNumber;
    } else {
      return isCurrency && currencySymbol
        ? `${currencySymbol} ${value}`
        : value;
    }
  } else {
    return isCurrency ? `${value}` : value;
  }
};

/** Parse API / UI date values for localization helpers (do not `parseInt` ISO strings). */
function coerceLocalizationDateInput(dateValue: unknown): Date {
  if (dateValue == null || dateValue === "") return new Date(NaN);
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === "number") {
    return new Date(Number.isFinite(dateValue) ? dateValue : NaN);
  }
  const s = String(dateValue).trim();
  if (s === "") return new Date(NaN);
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return new Date(Number.isFinite(n) ? n : NaN);
  }
  const parsed = Date.parse(s);
  return new Date(Number.isFinite(parsed) ? parsed : NaN);
}

export const formatDateBasedOnOrganizationLocalization = (
  localization?: Array<OrganizationLocalizationType>,
  dateValue?: any,
  onlyDate?: boolean,
  hideTimeZoneAndSeconds?: boolean,
) => {
  if (localization) {
    const dateFormat = getLocalizationValue(localization, "DATE", "FORMAT");
    const timeZone = getLocalizationValue(localization, "TIMEZONE", "ID");
    const timeZoneCode = getLocalizationValue(localization, "TIMEZONE", "CODE");

    if (dateFormat && timeZone && dateValue) {
      const base = momentTz(coerceLocalizationDateInput(dateValue)).tz(
        timeZone,
      );

      // Build format string
      let formatString = dateFormat;

      if (!onlyDate) {
        formatString += hideTimeZoneAndSeconds ? " hh:mm A" : " hh:mm:ss A";
      }

      let formatted = base.format(formatString);

      // Append timezone ONLY when not hidden
      if (!onlyDate && !hideTimeZoneAndSeconds) {
        formatted += ` ${timeZoneCode}`;
      }

      return formatted;
    } else {
      // Fallback formatting
      const formatString = onlyDate
        ? "MM/DD/YYYY"
        : hideTimeZoneAndSeconds
          ? "MM/DD/YYYY hh:mm A"
          : "MM/DD/YYYY hh:mm:ss A";

      return moment(coerceLocalizationDateInput(dateValue)).format(
        formatString,
      );
    }
  } else {
    // No localization
    const formatString = onlyDate
      ? "MM/DD/YYYY"
      : hideTimeZoneAndSeconds
        ? "MM/DD/YYYY hh:mm A"
        : "MM/DD/YYYY hh:mm:ss A";

    return moment(coerceLocalizationDateInput(dateValue)).format(formatString);
  }
};

export const formatTimeBasedOnOrganizationLocalization = (
  localization?: Array<OrganizationLocalizationType>,
  timeValue?: any,
  showSecondsAndTimeZone: boolean = true,
) => {
  if (localization) {
    const timeZone = getLocalizationValue(localization, "TIMEZONE", "ID");
    const timeZoneCode = getLocalizationValue(localization, "TIMEZONE", "CODE");

    if (timeZone && timeValue) {
      const format = showSecondsAndTimeZone ? "hh:mm:ss A" : "hh:mm A";
      return (
        momentTz(coerceLocalizationDateInput(timeValue))
          .tz(timeZone)
          .format(format) + (showSecondsAndTimeZone ? ` ${timeZoneCode}` : "")
      );
    } else {
      return moment(coerceLocalizationDateInput(timeValue)).format(
        showSecondsAndTimeZone ? "hh:mm:ss A" : "hh:mm A",
      );
    }
  } else {
    return moment(coerceLocalizationDateInput(timeValue)).format(
      showSecondsAndTimeZone ? "hh:mm:ss A" : "hh:mm A",
    );
  }
};

export const convertTimestampToHoursMinutes = (timestamp: number): string => {
  const totalMinutes = Math.floor(timestamp / 60000); // Convert milliseconds to minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let result = "";
  if (hours > 0) {
    result += `${hours}h`;
  }
  if (minutes > 0) {
    result += `${minutes}m`;
  }
  return result || "0m"; // Default to 0m if duration is 0
};

export const formatCurrencyAndConvertToWords = (
  value: number,
  localization: Array<OrganizationLocalizationType>,
): string => {
  // Get the user's language and currency code from localization
  const userLanguage =
    getLocalizationValue(localization, "LANGUAGE", "CODE") || "en";
  const currencyCode =
    getLocalizationValue(localization, "CURRENCY", "CODE") || "USD";

  // Format the number with the currency symbol
  const formattedCurrency = new Intl.NumberFormat(userLanguage, {
    style: "currency",
    currency: currencyCode,
  }).format(value);

  // Convert the number to words
  const numberInWords = NumberToWords.toWords(value);

  // Get the currency name in words (e.g., "dollars", "rupees", "euros") based on user's language
  const currencyName = new Intl.DisplayNames([userLanguage], {
    type: "currency",
  }).of(currencyCode);

  // Combine the words with the currency
  const result = `${numberInWords} ${currencyName} only`;

  // Example: "forty thousand rupees only"
  return (
    // result.charAt(0).toUpperCase() + result.slice(1) + ` (${formattedCurrency})`
    result.charAt(0).toUpperCase() + result.slice(1)
  );
};

export const formatDateBasedOnOrganizationLocalizationForEvent = (
  localization?: Array<OrganizationLocalizationType>,
  dateValue?: any,
  type: string = "date",
) => {
  if (localization) {
    const dateFormat = getLocalizationValue(localization, "DATE", "FORMAT");
    const timeZone = getLocalizationValue(localization, "TIMEZONE", "ID");

    if (type === "date") {
      if (dateFormat && timeZone && dateValue) {
        return momentTz(
          new Date(
            typeof dateValue === "string" ? parseInt(dateValue) : dateValue,
          ),
        )
          .tz(timeZone)
          .format(`${dateFormat?.replace(/\//g, "/")}`); // Only include the date portion
      } else {
        return moment(parseInt(dateValue?.toString())).format("MM-DD-YYYY");
      }
    } else {
      if (dateValue && timeZone && dateFormat) {
        console.log("Processing with:", { dateValue, timeZone, dateFormat });

        // Parse the date and adjust for the provided time zone
        // const localizedTime = momentTz(
        //   new Date(
        //     typeof dateValue === "string" ? parseInt(dateValue) : dateValue
        //   )
        // )
        // .tz(timeZone)
        // .format(dateFormat);

        // Convert the localized date string back to a timestamp
        const localizedTimestamp = momentTz.tz(dateValue, timeZone).valueOf();

        console.log("Processing with:", localizedTimestamp);
        return localizedTimestamp;
      } else {
        return moment(parseInt(dateValue?.toString())).format("MM-DD-YYYY");
      }
    }
  }
  return moment(parseInt(dateValue?.toString())).format("MM-DD-YYYY");
};

export const formatDateBasedOnOrganizationLocalizationForNotification = (
  localization?: Array<OrganizationLocalizationType>,
  dateValue?: any,
) => {
  if (localization) {
    const dateFormat = getLocalizationValue(localization, "DATE", "FORMAT");
    const timeZone = getLocalizationValue(localization, "TIMEZONE", "ID");

    if (dateFormat && timeZone && dateValue) {
      return momentTz(
        new Date(
          typeof dateValue == "string" ? parseInt(dateValue) : dateValue,
        ),
      )
        .tz(timeZone)
        .format(`${dateFormat?.replace(/\//g, "/")}`); // Only include the date portion
    } else {
      return moment(parseInt(dateValue?.toString())).format("MM-DD-YYYY");
    }
  } else {
    return moment(parseInt(dateValue?.toString())).format("MM-DD-YYYY");
  }
};

const formatNumberSystemKeys = (str: string) => {
  return str.toLowerCase().replace(/_([a-z])/g, function (match, char) {
    return char.toUpperCase();
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const getCurrencyBasedOnCountry = (isoCode: string) => {
  const selectedCountry: any = countries.filter((value) => {
    if (value.cca2 == isoCode) {
      return value;
    }
  });
  return {
    CURRENCY: {
      CODE: Object.keys(selectedCountry?.[0].currencies)[0],
      SYMBOL: (Object.values(selectedCountry?.[0].currencies)[0] as any)
        ?.symbol,
      NAME: (Object.values(selectedCountry?.[0].currencies)[0] as any)?.name,
    },
  };
};

export function generateTextControllerJsonArray(text: string) {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const sections = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const result: Array<any> = [];

  function generateId() {
    // (* change this because getting duplicated)
    // return Math.random().toString(36).substr(2, 5);
    return uuidv4();
  }

  sections.forEach((section) => {
    const parts = section.split(boldRegex);
    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // Non-bold text
        if (part.trim()) {
          result.push({
            type: "p",
            id: generateId(),
            children: [{ text: part }],
          });
        }
      } else {
        // Bold text
        if (part.trim()) {
          // Add check to ensure part is not empty
          result.push({
            type: "p",
            id: generateId(),
            children: [{ text: part, bold: true }],
          });
        }
      }
    });
  });

  // Filter out any null/undefined values before returning
  return result.filter(
    (item) =>
      item !== null &&
      item !== undefined &&
      typeof item === "object" &&
      item.type &&
      item.children,
  );
}

export const copyToClipboard = async (link: string) => {
  await navigator.clipboard.writeText(link);
};

export const checkUserExpired = (user: UserHubDataTypes) => {
  return (
    (Date.now() - parseInt(user.userStatusUpdatedAt)) / (1000 * 60 * 60 * 24) >
    30
  );
};

export const getDashboardDropDownTimeValues = (
  localizationValue: OrganizationLocalizationType[] | undefined,
  value: "TODAY" | "ALL" | "THIS_WEEK" | "THIS_MONTH",
) => {
  const startOfMonth = moment().startOf("month");
  const endOfMonth = moment().endOf("month");
  const startofWeek = moment().startOf("week");
  const endofWeek = moment().endOf("week");
  switch (value) {
    case "ALL":
      return "";
    case "THIS_MONTH":
      return `${formatDateBasedOnOrganizationLocalization(
        localizationValue,
        startOfMonth.toDate().getTime(),
        true,
      )} - ${formatDateBasedOnOrganizationLocalization(
        localizationValue,
        endOfMonth.toDate().getTime(),
        true,
      )}`;
    case "THIS_WEEK":
      return `${formatDateBasedOnOrganizationLocalization(
        localizationValue,
        startofWeek.toDate().getTime(),
        true,
      )} - ${formatDateBasedOnOrganizationLocalization(
        localizationValue,
        endofWeek.toDate().getTime(),
        true,
      )}`;
    case "TODAY":
      return formatDateBasedOnOrganizationLocalization(
        localizationValue,
        new Date().getTime(),
        true,
      );
    default:
      return "";
  }
};

export const formatNotificationMessage = (
  notification: NotificationDataTypes,
  notificationMessage: string,
  localizationValue?: Array<OrganizationLocalizationType>,
) => {
  if (notification.module == PushNotificationModule.LEAD_MANAGER) {
    if (notification.subModule == PushNotificationSubModule.LEAD_MASTER) {
      switch (notification.notificationType) {
        case PushNotificationType.LEAD_CREATED_WITH_MEETING_SCHEDULE:
          return notificationMessage.replace(
            "{MEETING_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.meetingDate,
            ),
          );
        case PushNotificationType.LEAD_SNOOZED:
          return notificationMessage.replace(
            "{SNOOZE_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.snoozedDate,
            ),
          );
        case PushNotificationType.BULK_SNOOZE:
          return notificationMessage.replace(
            "{SNOOZE_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.snoozedDate,
            ),
          );
        default:
          return notificationMessage;
      }
    } else if (
      notification.subModule == PushNotificationSubModule.LEAD_PROFILE
    ) {
      switch (notification.notificationType) {
        case PushNotificationType.CREATED_ONLINE_MEETING:
          return notificationMessage.replace(
            "{ONLINE_EVENT_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.onLineMeetTimeStamp,
            ),
          );
        case PushNotificationType.CREATED_OFFLINE_MEETING:
          return notificationMessage.replace(
            "{OFFLINE_MEETING_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.offLineMeetTimeStamp,
            ),
          );
        case PushNotificationType.UPDATED_ONLINE_MEETING:
          return notificationMessage.replace(
            "{ONLINE_EVENT_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.onLineMeetTimeStamp,
            ),
          );
        case PushNotificationType.UPDATED_OFFLINE_MEETING:
          return notificationMessage.replace(
            "{OFFLINE_MEETING_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.offLineMeetTimeStamp,
            ),
          );

        default:
          return notificationMessage;
      }
    } else {
      return notificationMessage;
    }
  } else if (notification.module == PushNotificationModule.PREFERENCES) {
    if (notification.subModule == PushNotificationSubModule.ADMIN) {
      switch (notification.notificationType) {
        case PushNotificationType.SLOT_AVAILABILITY_ADDED:
          return notificationMessage.replace(
            "{SPECIFIC_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.startTime,
            ),
          );
        case PushNotificationType.SLOT_AVAILABILITY_UPDATED:
          return notificationMessage.replace(
            "{SPECIFIC_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.startTime,
            ),
          );
        case PushNotificationType.SLOT_AVAILABILITY_REMOVED:
          return notificationMessage.replace(
            "{SPECIFIC_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.startTime,
            ),
          );
        case PushNotificationType.MARKED_AS_UNAVILABLE:
          return notificationMessage.replace(
            "{SPECIFIC_UNAVAILABLE_DATE}",
            formatDateBasedOnOrganizationLocalizationForNotification(
              localizationValue,
              notification.metaData?.unAvailableTimeStamp,
            ),
          );
        default:
          return notificationMessage;
      }
    } else {
      return notificationMessage;
    }
  } else {
    return notificationMessage;
  }
};

export function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) return apiKey; // handle short keys if needed
  const start = apiKey.slice(0, 4);
  const end = apiKey.slice(-4);
  const masked = `${start}***${end}`;
  return masked;
}

export async function fetchAndInlineResources(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]');
  const fontLinks = doc.querySelectorAll('link[rel="preload"][as="font"]');

  async function fetchAndInlineCSS(link: Element) {
    const href = link.getAttribute("href");
    if (href) {
      const cssUrl = new URL(href, window.location.origin).href;
      try {
        const cssResponse = await fetch(cssUrl);
        const cssText = await cssResponse.text();
        const style = doc.createElement("style");
        style.textContent = cssText;
        if (link.parentNode) {
          link.parentNode.replaceChild(style, link);
        }
      } catch (error) {
        console.error(`Failed to fetch CSS from ${cssUrl}:`, error);
      }
    }
  }

  async function fetchAndInlineFont(link: Element) {
    const href = link.getAttribute("href");
    if (href) {
      const fontUrl = new URL(href, window.location.origin).href;
      try {
        const fontResponse = await fetch(fontUrl);
        const fontBlob = await fontResponse.blob();
        const reader = new FileReader();
        reader.onload = function (e) {
          const fontDataUrl = e.target?.result as string;
          const style = doc.createElement("style");
          const fontFamily =
            link.getAttribute("data-font-family") || "CustomFont";
          const fontWeight = link.getAttribute("data-font-weight") || "normal";
          const fontStyle = link.getAttribute("data-font-style") || "normal";
          style.textContent = `
            @font-face {
              font-family: '${fontFamily}';
              font-weight: ${fontWeight};
              font-style: ${fontStyle};
              src: url('${fontDataUrl}') format('${getFontFormat(href)}');
            }
          `;
          if (link.parentNode) {
            link.parentNode.replaceChild(style, link);
          }
        };
        reader.readAsDataURL(fontBlob);
      } catch (error) {
        console.error(`Failed to fetch font from ${fontUrl}:`, error);
      }
    }
  }

  function getFontFormat(url: string): string {
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "woff":
        return "woff";
      case "woff2":
        return "woff2";
      case "ttf":
        return "truetype";
      case "otf":
        return "opentype";
      default:
        return "auto";
    }
  }

  const cssPromises = Array.from(cssLinks).map(fetchAndInlineCSS);
  const fontPromises = Array.from(fontLinks).map(fetchAndInlineFont);

  await Promise.all([...cssPromises, ...fontPromises]);

  return doc.documentElement.outerHTML;
}

export const generateInvoiceDetailHtml = async (
  invoicePaymentSchedules: InvoiceData[],
  localizationValue: OrganizationLocalizationType[],
  currency: string,
) => {
  return `${invoicePaymentSchedules?.map((invoice) => {
    return `<ul style="color: #192a3e">
    <li><span><strong>Invoice Number: </strong>${invoice?.invoiceSerial
      }</span></li>
  <li><span><strong>Amount Due:</strong>${currency} ${formatNumberITL(
        localizationValue,
        invoice?.totalAmount as string | number | undefined,
      )}</span></li>
   <li><span><strong>Due Date:</strong> ${formatDateBasedOnOrganizationLocalization(
        localizationValue,
        invoice?.invoiceDueDate,
        true,
      )}</span></li>
 </ul>`;
  })}`;
};

export const formatUnitType = (unit: {
  itemUnitValue: string;
  powerValue?: number;
}) => {
  return `${unit?.itemUnitValue}${unit?.powerValue === 2 ? "²" : unit?.powerValue === 3 ? "³" : ""
    }`;
};

export const convertDateStringToTimestamp = (dateStr: string) => {
  // Try different date formats
  const formats = ["DD/MM/YYYY", "DD-MM-YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

  for (const format of formats) {
    const parsed = dayjs(dateStr, format);
    if (parsed.isValid()) {
      return parsed.valueOf();
    }
  }

  // If no format matches, try native Date parsing as fallback
  const fallbackDate = new Date(dateStr);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate.getTime();
  }

  // Return current timestamp if parsing fails
  return Date.now();
};

export const getLocalizedDateFormat = (countryCode: string) => {
  const formatter = new Intl.DateTimeFormat(countryCode);
  const parts = formatter.formatToParts(new Date());

  const format = parts
    .map((part) => {
      if (part.type === "day") return "DD";
      if (part.type === "month") return "MM";
      if (part.type === "year") return "YYYY";
      return part.value;
    })
    .join("");

  return format;
};

export const parseAttachments = (
  attachmentsString: string | string[],
): string[] => {
  try {
    try {
      let parsedAttachments: string[] = [];

      if (typeof attachmentsString === "string") {
        // Handle string format (remove curly braces and quotes)
        const cleanString = attachmentsString
          .replace(/[{}]/g, "")
          .split(",")
          .map((url: any) => url.trim())
          .filter((url: any) => url && url.length > 0)
          .map((url: any) => url.replace(/^"|"$/g, "")); // Remove any remaining quotes

        parsedAttachments = cleanString;
      } else if (Array.isArray(attachmentsString)) {
        // Handle array format
        parsedAttachments = attachmentsString;
      } else if (typeof attachmentsString === "object") {
        // Handle object format
        parsedAttachments = Object.values(attachmentsString).filter(
          (url: any): url is string => typeof url === "string",
        );
      }
      return parsedAttachments;
    } catch (error) {
      console.error("Error parsing attachments:", error);
      return [];
    }
  } catch (error) {
    console.error("Error parsing attachments:", error);
    return [];
  }
};

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  format?: "JPEG" | "PNG" | "WEBP";
  quality?: number;
  rotation?: number;
}

// Default compression options
const DEFAULT_COMPRESSION_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  format: "JPEG",
  quality: 70,
  rotation: 0,
};

/**
 * Compresses an image file using react-image-file-resizer
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = (
  file: File,
  options: ImageCompressionOptions = {},
): Promise<File> => {
  const config = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    try {
      Resizer.imageFileResizer(
        file,
        config.maxWidth,
        config.maxHeight,
        config.format,
        config.quality,
        config.rotation,
        (uri) => {
          resolve(uri as File);
        },
        "file",
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Compresses multiple image files
 * @param files - Array of image files to compress
 * @param options - Compression options (optional)
 * @returns Promise<File[]> - Array of compressed image files
 */
export const compressImages = async (
  files: File[],
  options: ImageCompressionOptions = {},
): Promise<File[]> => {
  try {
    const compressedFiles = await Promise.all(
      files.map((file) => compressImage(file, options)),
    );
    return compressedFiles;
  } catch (error) {
    console.error("Error compressing images:", error);
    throw error;
  }
};

/**
 * ONE FUNCTION TO RULE THEM ALL! 🎯
 * Compresses any image data (File, Blob, base64, ArrayBuffer) to a compressed File
 * Handles all conversion internally - just pass any image data and get compressed File back
 * @param imageData - File, Blob, base64 string, or ArrayBuffer
 * @param fileName - Optional filename for the output (default: "compressed-image")
 * @param maxSize - Maximum width/height (default: 1024)
 * @param quality - Image quality 0-100 (default: 70)
 * @returns Promise<File> - Compressed image file ready for upload
 */
export const compressImageFile = async (
  imageData: File | Blob | string | ArrayBuffer,
  fileName: string = "compressed-image",
  maxSize: number = 1024,
  quality: number = 70,
): Promise<File> => {
  try {
    let fileToCompress: File;
    if (imageData instanceof File) {
      fileToCompress = imageData;
    } else if (imageData instanceof Blob) {
      fileToCompress = new File([imageData], fileName, {
        type: imageData.type || "image/jpeg",
      });
    } else if (typeof imageData === "string") {
      // Handle base64 string
      const base64Data = imageData.includes(",")
        ? imageData.split(",")[1]
        : imageData;
      const blob = base64ToBlob(base64Data);
      fileToCompress = new File([blob], fileName, { type: "image/jpeg" });
    } else if (imageData instanceof ArrayBuffer) {
      // Handle ArrayBuffer
      const blob = new Blob([imageData], { type: "image/jpeg" });
      fileToCompress = new File([blob], fileName, { type: "image/jpeg" });
    } else {
      throw new Error("Unsupported image data type");
    }

    // Compress the image
    return new Promise((resolve, reject) => {
      Resizer.imageFileResizer(
        fileToCompress,
        maxSize,
        maxSize,
        "JPEG",
        quality,
        0,
        (uri) => {
          resolve(uri as File);
        },
        "file",
      );
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    throw error;
  }
};

export type DateFilterType = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "ALL";

export interface DateRange {
  startDate: number | null;
  endDate: number | null;
}

export const getDateRangeByFilter = (filter: DateFilterType): DateRange => {
  const now = new Date();

  switch (filter) {
    case "TODAY": {
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      return {
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
      };
    }

    case "THIS_WEEK": {
      // Week starts on Monday (ISO standard)
      const startDate = new Date(now);
      const day = startDate.getDay(); // 0 = Sun, 1 = Mon
      const diff = day === 0 ? -6 : 1 - day;

      startDate.setDate(startDate.getDate() + diff);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      return {
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
      };
    }

    case "THIS_MONTH": {
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      return {
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
      };
    }

    default:
      return {
        startDate: null,
        endDate: null,
      };
  }
};

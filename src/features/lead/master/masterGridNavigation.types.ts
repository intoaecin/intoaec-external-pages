export type LeadMasterSortOrder = "ASC" | "DESC";

export type ParsedQueryValue = string | number | boolean | null | ParsedQueryValue[];

export type LeadMasterQueryParams = Record<string, ParsedQueryValue | undefined>;

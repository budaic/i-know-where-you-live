/**
 * Parse a full name into first name, middle names, and last name
 * Expected format: "FIRSTNAME MIDDLENAME1 MIDDLENAME2 LASTNAME"
 * 
 * Examples:
 * - "John Smith" → firstName: "John", middleNames: [], lastName: "Smith"
 * - "John Michael Smith" → firstName: "John", middleNames: ["Michael"], lastName: "Smith"
 * - "John Michael David Smith" → firstName: "John", middleNames: ["Michael", "David"], lastName: "Smith"
 * - "John" → firstName: "John", middleNames: [], lastName: ""
 */
export function parseName(fullName: string): { 
  firstName: string; 
  lastName: string; 
  middleNames: string[] 
} {
  const trimmedName = fullName.trim();
  const parts = trimmedName.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) {
    return { firstName: '', lastName: '', middleNames: [] };
  }
  
  if (parts.length === 1) {
    // If only one part, treat it as first name
    return { firstName: parts[0], lastName: '', middleNames: [] };
  }
  
  if (parts.length === 2) {
    // If two parts, first is first name, second is last name
    return { firstName: parts[0], lastName: parts[1], middleNames: [] };
  }
  
  // If three or more parts:
  // First part is always first name
  const firstName = parts[0];
  
  // Last part is always last name
  const lastName = parts[parts.length - 1];
  
  // Everything in between is middle names
  const middleNames = parts.slice(1, -1);
  
  return { firstName, lastName, middleNames };
}

/**
 * Get the full name from parsed components
 */
export function formatName(firstName: string, lastName: string, middleNames: string[] = []): string {
  const parts = [firstName, ...middleNames, lastName].filter(part => part.length > 0);
  return parts.join(' ');
}

/**
 * Get just the first and last name (no middle names)
 */
export function getFirstLastName(fullName: string): { firstName: string; lastName: string } {
  const { firstName, lastName } = parseName(fullName);
  return { firstName, lastName };
}

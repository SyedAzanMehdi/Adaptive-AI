export interface GlossaryEntry {
  term: string;
  urdu: string;
  roman: string;
  meaning: string;
}

/**
 * Dual-language glossary for the Global Access Doctrine — core CS terms
 * anchored in Urdu so Pakistani and bilingual students learn twice as fast.
 */
export const URDU_GLOSSARY: GlossaryEntry[] = [
  { term: "Algorithm", urdu: "الگورتھم", roman: "Algorithm", meaning: "A step-by-step recipe for solving a problem in finite steps." },
  { term: "Data Structure", urdu: "ڈیٹا اسٹرکچر", roman: "Data Structure", meaning: "An organized way to store data so it can be used efficiently." },
  { term: "Variable", urdu: "متغیر", roman: "Mutaghayyir", meaning: "A named container whose value can change while a program runs." },
  { term: "Function", urdu: "تفاعل", roman: "Tafaaul", meaning: "A reusable block of code that runs when it is called." },
  { term: "Loop", urdu: "دَور", roman: "Daur", meaning: "Repeating a block of code until a condition stops it." },
  { term: "Array", urdu: "ترتیب وار فہرست", roman: "Tarteeb-war fehrist", meaning: "An ordered list of values accessed by position." },
  { term: "Object", urdu: "آبجیکٹ", roman: "Object", meaning: "A bundle of related data and the behaviors that act on it." },
  { term: "Class", urdu: "کلاس", roman: "Class", meaning: "A blueprint for creating objects with shared structure." },
  { term: "Recursion", urdu: "بازگشت", roman: "Baazgasht", meaning: "A function that calls itself on a smaller version of the problem." },
  { term: "Complexity", urdu: "پیچیدگی", roman: "Paicheedgi", meaning: "How time or memory needs grow as input size grows (Big-O)." },
  { term: "Database", urdu: "ڈیٹابیس", roman: "Database", meaning: "A system for storing, querying, and updating data reliably." },
  { term: "Server", urdu: "مہیّا کنندہ", roman: "Mohaiya kuninda", meaning: "A program that answers requests from other programs or clients." },
  { term: "Network", urdu: "نیٹ ورک", roman: "Network", meaning: "Computers connected so they can exchange data." },
  { term: "Cache", urdu: "ذخیرہ", roman: "Zakheera", meaning: "A fast, small store that keeps frequently used data close." },
  { term: "Bug", urdu: "خرابی", roman: "Kharabi", meaning: "A mistake in code that causes wrong or unexpected behavior." },
  { term: "Debugging", urdu: "خرابی زدائی", roman: "Kharabi zadaai", meaning: "The process of finding and fixing mistakes in code." },
  { term: "API", urdu: "اے پی آئی", roman: "API", meaning: "The agreed surface through which two programs talk to each other." },
  { term: "Encryption", urdu: "خفیہ کاری", roman: "Khufiya kaari", meaning: "Scrambling data so only authorized readers can understand it." },
  { term: "Deployment", urdu: "تعیناتی", roman: "Tainati", meaning: "Releasing code so real users can run it." },
  { term: "Scalability", urdu: "وسعت پذیری", roman: "Wus'at pazeeri", meaning: "A system's ability to grow with more users or data without breaking." },
];

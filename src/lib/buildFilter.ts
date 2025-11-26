const buildWhereClause = (filters: any) => {
  const whereClause: any = {};

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "object" && !Array.isArray(value)) {
      whereClause[key] = {
        some: buildWhereClause(value), // Nested relations like 'projects'
      };
    } else {
      whereClause[key] = value; // Direct field filters like 'name' or 'role'
    }
  }

  return whereClause;
};

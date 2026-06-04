function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variable d'environnement manquante : ${key}`);
  return value;
}

export const LIEU             = requireEnv("LIEU");
export const DEFAULT_GROUP_ID = requireEnv("DEFAULT_GROUP_ID");

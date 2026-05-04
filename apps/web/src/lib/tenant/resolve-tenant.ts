export type TenantContext = {
  hostname: string;
  normalizedHostname: string;
  mode: "root" | "subdomain" | "custom-domain";
  tenantSlug: string | null;
  label: string;
};

function stripPort(hostname: string): string {
  return hostname.split(":")[0]?.toLowerCase() ?? "";
}

export function resolveTenantContext(
  hostname: string,
  rootDomain: string,
): TenantContext {
  const normalizedHostname = stripPort(hostname);
  const normalizedRootDomain = stripPort(rootDomain);

  if (
    normalizedHostname === normalizedRootDomain ||
    normalizedHostname === `www.${normalizedRootDomain}` ||
    normalizedHostname === "localhost"
  ) {
    return {
      hostname,
      normalizedHostname,
      mode: "root",
      tenantSlug: null,
      label: "Portal principal",
    };
  }

  if (normalizedHostname.endsWith(`.${normalizedRootDomain}`)) {
    const tenantSlug = normalizedHostname.replace(`.${normalizedRootDomain}`, "");

    return {
      hostname,
      normalizedHostname,
      mode: "subdomain",
      tenantSlug,
      label: `Tenant ${tenantSlug}`,
    };
  }

  return {
    hostname,
    normalizedHostname,
    mode: "custom-domain",
    tenantSlug: null,
    label: "Dominio personalizado",
  };
}

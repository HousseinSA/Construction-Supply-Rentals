export const createEquipmentFilters = (t: any, locations: Array<{ value: string; label: string }>) => [
  {
    key: "status",
    label: t("status"),
    options: [
      { value: "all", label: t("filters.allStatus") },
      { value: "pending", label: t("pending") },
      { value: "approved", label: t("approved") },
      { value: "rejected", label: t("rejected") },
      { value: "pendingPricing", label: t("pricingUpdateRequest") },
    ],
  },
  {
    key: "listingType",
    label: t("listingType"),
    options: [
      { value: "all", label: t("filters.allTypes") },
      { value: "forRent", label: t("forRent") },
      { value: "forSale", label: t("forSale") },
    ],
  },
  {
    key: "availability",
    label: t("availability"),
    options: [
      { value: "all", label: t("filters.allAvailability") },
      { value: "available", label: t("available") },
      { value: "unavailable", label: t("unavailable") },
    ],
  },
  {
    key: "location",
    label: t("location"),
    options: [{ value: "all", label: t("filters.allLocations") }, ...locations],
  },
]

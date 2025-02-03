export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

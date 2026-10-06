const INITIAL_INVOICE = {
  status: 'UNPAID', totalBayar: 3750142
};
const profile = { kycVerified: true, kycSubmitted: true };

const getInitialStep = (profile, invoice) => {
  if (profile.kycVerified && invoice.status === 'UNPAID') {
    if (invoice.totalBayar > 0) return 3;
    return 2;
  }
  return 1;
}

console.log(getInitialStep(profile, INITIAL_INVOICE));

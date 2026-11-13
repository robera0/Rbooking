// Which Telebirr number an order was paid to. Orders that are not paid have
// nothing to show; paid orders with no recorded number are either free or
// were paid before numbers were recorded.
const PaidToCell = ({ txn }) => {
  if (txn.status !== "paid") return <span className="text-gray-600">—</span>;
  if (txn.paidTo?.accountNumber) {
    return (
      <>
        <p className="font-bold text-white tabular-nums">
          {txn.paidTo.accountNumber}
        </p>
        {txn.paidTo.receiverName && (
          <p className="text-gray-500 truncate">{txn.paidTo.receiverName}</p>
        )}
      </>
    );
  }
  if (txn.paidTo?.receiverName) {
    return (
      <>
        <p className="font-bold text-yellow-400">Shared name</p>
        <p className="text-gray-500 truncate">{txn.paidTo.receiverName}</p>
      </>
    );
  }
  if (Number(txn.totalAmount) === 0) {
    return <span className="text-gray-500">Free</span>;
  }
  return <span className="text-gray-500">Before tracking</span>;
};

export default PaidToCell;

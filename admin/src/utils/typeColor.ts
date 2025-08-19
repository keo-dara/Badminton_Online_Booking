import { SaleStatus } from "~/models";

export default (status: SaleStatus) => {

  if (status === SaleStatus.Pending) {
    return "warning"
  } else if (status  === SaleStatus.Paid) {
    return "success"
  } else if (status === SaleStatus.Draft) {
    return "info"
  }

  return "default"

}

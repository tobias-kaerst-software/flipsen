resource "azurerm_resource_group" "rg" {
  name     = "${local.project_name}-proxies-rg"
  location = "Germany West Central"
}

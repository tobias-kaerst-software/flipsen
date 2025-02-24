resource "azurerm_storage_account" "storage_account" {
  name = "${local.project_name}${var.environment}st"

  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  access_tier              = "Hot"
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "movies" {
  storage_account_id = azurerm_storage_account.storage_account.id

  name                  = "movies"
  container_access_type = "blob"
}

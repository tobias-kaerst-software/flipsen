resource "mongodbatlas_project" "project" {
  name   = local.project_name
  org_id = local.mongo_org_id
}

resource "mongodbatlas_project_ip_access_list" "ip_access" {
  for_each = { for ip in jsondecode(local.mongo_project_whitelist) : ip.ip => ip }

  project_id = mongodbatlas_project.project.id

  cidr_block = each.value.ip
  comment    = each.value.comment
}

resource "mongodbatlas_flex_cluster" "cluster" {
  project_id = mongodbatlas_project.project.id

  name = "${var.environment}-cluster"

  provider_settings = {
    backing_provider_name = "AWS"
    region_name           = "EU_CENTRAL_1"
  }
}

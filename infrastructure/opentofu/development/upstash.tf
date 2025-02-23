resource "upstash_redis_database" "cache" {
  database_name = "${local.project_name}-${var.environment}"

  region         = "global"
  primary_region = "eu-central-1"
  tls            = true
  eviction       = true
  auto_scale     = false
}

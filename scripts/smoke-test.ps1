$ErrorActionPreference = 'Stop'
$menuUrl = 'http://localhost:8081/api'
$orderUrl = 'http://localhost:8082/api'
function Post-Json($url, $body) { Invoke-RestMethod -Method Post -Uri $url -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 8) }
$category = $null
$dish = $null
try {
    $category = Post-Json "$menuUrl/categories" @{ name = "Smoke test $(Get-Date -Format HHmmss)" }
    $dish = Post-Json "$menuUrl/dishes" @{ name = 'Test pizza'; description = 'Smoke test'; price = 12.50; available = $true; categoryId = $category.id }
    $order = Post-Json "$orderUrl/orders" @{ customerName = 'Smoke test'; tableNumber = 1; items = @(@{ dishId = $dish.id; quantity = 2 }) }
    if ([decimal]$order.total -ne 25.00) { throw 'Unexpected order total' }
    $null = Invoke-RestMethod -Method Put -Uri "$menuUrl/dishes/$($dish.id)" -ContentType 'application/json' -Body (@{ name = 'Renamed pizza'; description = 'Updated'; price = 99; available = $true; categoryId = $category.id } | ConvertTo-Json)
    $saved = Invoke-RestMethod "$orderUrl/orders/$($order.id)"
    if ([decimal]$saved.items[0].unitPrice -ne 12.50 -or $saved.items[0].dishName -ne 'Test pizza') { throw 'Order price/name snapshot changed' }
    $null = Invoke-RestMethod -Method Patch -Uri "$orderUrl/orders/$($order.id)/status" -ContentType 'application/json' -Body '{"status":"CANCELLED"}'
    Write-Output 'PASS: OpenFeign order creation, backend total, saved price/name snapshot, and cancellation.'
} finally {
    if ($null -ne $dish) { Invoke-RestMethod -Method Delete -Uri "$menuUrl/dishes/$($dish.id)" }
    if ($null -ne $category) { Invoke-RestMethod -Method Delete -Uri "$menuUrl/categories/$($category.id)" }
}

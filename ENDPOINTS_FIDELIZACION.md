# Endpoints para Funcionalidades de Fidelización

## 1. Endpoint: Obtener Clientes con Último Pedido

**Descripción:** Este endpoint devuelve la lista de clientes con información sobre su último pedido, filtrado por días de inactividad.

### Request

```
GET /api/customers/with-last-order?daysSinceLastOrder={días}
```

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `daysSinceLastOrder` | number | No | Número de días desde el último pedido. Si no se proporciona o es 0, devuelve todos los clientes con pedidos. |

### Response 200 OK

```json
[
  {
    "customerId": "uuid-del-cliente",
    "customerName": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phoneNumber": "+543512345678",
    "address": "Av. Colón 1234",
    "type": "Regular",
    "lastOrderId": "uuid-del-pedido",
    "lastOrderNumber": "ORD-001",
    "lastOrderDate": "2024-10-15T14:30:00",
    "lastOrderAmount": 15000.50,
    "lastOrderStatus": "DELIVERED",
    "daysSinceLastOrder": 34,
    "totalOrders": 12
  },
  {
    "customerId": "uuid-del-cliente-2",
    "customerName": "María González",
    "email": "maria.gonzalez@example.com",
    "phoneNumber": "+543519876543",
    "address": "Calle Falsa 123",
    "type": "Premium",
    "lastOrderId": "uuid-del-pedido-2",
    "lastOrderNumber": "ORD-045",
    "lastOrderDate": "2024-05-20T10:15:00",
    "lastOrderAmount": 25300.00,
    "lastOrderStatus": "DELIVERED",
    "daysSinceLastOrder": 180,
    "totalOrders": 28
  }
]
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `customerId` | string (UUID) | ID único del cliente |
| `customerName` | string | Nombre completo del cliente |
| `email` | string | Email del cliente |
| `phoneNumber` | string | Teléfono del cliente |
| `address` | string | Dirección del cliente |
| `type` | string | Tipo de cliente (opcional) |
| `lastOrderId` | string (UUID) | ID del último pedido (puede ser null) |
| `lastOrderNumber` | string | Número del último pedido (puede ser null) |
| `lastOrderDate` | string (ISO 8601) | Fecha del último pedido (puede ser null) |
| `lastOrderAmount` | number | Monto total del último pedido (puede ser null) |
| `lastOrderStatus` | string | Estado del último pedido (puede ser null) |
| `daysSinceLastOrder` | number | Días transcurridos desde el último pedido (puede ser null) |
| `totalOrders` | number | Cantidad total de pedidos del cliente (puede ser null/0) |

### Lógica de Filtrado

- Si `daysSinceLastOrder` **no se proporciona** o es **0**: Devuelve TODOS los clientes que tienen al menos un pedido
- Si `daysSinceLastOrder` **es mayor a 0**: Devuelve solo los clientes cuyo último pedido fue hace **N días o más**

### Ejemplos de Uso

1. **Obtener todos los clientes con pedidos:**
   ```
   GET /api/customers/with-last-order
   GET /api/customers/with-last-order?daysSinceLastOrder=0
   ```

2. **Clientes inactivos hace más de 7 días:**
   ```
   GET /api/customers/with-last-order?daysSinceLastOrder=7
   ```

3. **Clientes inactivos hace más de 1 mes:**
   ```
   GET /api/customers/with-last-order?daysSinceLastOrder=30
   ```

4. **Clientes inactivos hace más de 3 meses:**
   ```
   GET /api/customers/with-last-order?daysSinceLastOrder=90
   ```

5. **Clientes inactivos hace más de 6 meses:**
   ```
   GET /api/customers/with-last-order?daysSinceLastOrder=180
   ```

6. **Clientes inactivos hace más de 1 año:**
   ```
   GET /api/customers/with-last-order?daysSinceLastOrder=365
   ```

### Consideraciones de Implementación

1. **Cálculo de días:**
   - Usar `CURRENT_DATE` o `LocalDate.now()` para obtener la fecha actual
   - Calcular la diferencia en días entre la fecha del último pedido y hoy

2. **Ordenamiento:**
   - Se recomienda ordenar por `daysSinceLastOrder` DESC (los más inactivos primero)

3. **Performance:**
   - Si tienes muchos clientes, considera agregar paginación
   - Indexar la columna `order_date` en la tabla de pedidos

4. **SQL Ejemplo (conceptual):**
   ```sql
   SELECT
     c.id as customerId,
     c.name as customerName,
     c.email,
     c.phone_number as phoneNumber,
     c.address,
     c.type,
     o.id as lastOrderId,
     o.order_number as lastOrderNumber,
     o.order_date as lastOrderDate,
     o.total_amount as lastOrderAmount,
     o.status as lastOrderStatus,
     DATEDIFF(CURRENT_DATE, o.order_date) as daysSinceLastOrder,
     COUNT(all_orders.id) as totalOrders
   FROM customers c
   LEFT JOIN LATERAL (
     SELECT * FROM orders
     WHERE customer_id = c.id
     ORDER BY order_date DESC
     LIMIT 1
   ) o ON true
   LEFT JOIN orders all_orders ON all_orders.customer_id = c.id
   WHERE c.tenant_id = :tenantId
     AND o.id IS NOT NULL
     AND (:daysSinceLastOrder = 0 OR DATEDIFF(CURRENT_DATE, o.order_date) >= :daysSinceLastOrder)
   GROUP BY c.id, o.id
   ORDER BY daysSinceLastOrder DESC
   ```

---

## 2. Endpoint: Enviar Email Promocional

**Descripción:** Este endpoint envía un email promocional a una lista de clientes seleccionados.

### Request

```
POST /api/promotions/send-email
Content-Type: application/json
```

### Request Body

```json
{
  "customerIds": [
    "uuid-cliente-1",
    "uuid-cliente-2",
    "uuid-cliente-3"
  ],
  "subject": "¡Oferta especial solo para ti!",
  "message": "Hola! Te extrañamos y queremos premiarte.\nObtén un 20% de descuento en tu próximo pedido usando el código: VOLVEMOS20\n\n¡No te lo pierdas!"
}
```

### Request Body Schema

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `customerIds` | array<string> | Sí | Lista de UUIDs de los clientes destinatarios |
| `subject` | string | Sí | Asunto del email (max 200 caracteres) |
| `message` | string | Sí | Cuerpo del mensaje del email |

### Response 200 OK

```json
{
  "success": true,
  "sentCount": 3,
  "failedCount": 0,
  "message": "Emails enviados exitosamente"
}
```

### Response Body Schema

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Indica si la operación fue exitosa |
| `sentCount` | number | Cantidad de emails enviados exitosamente |
| `failedCount` | number | Cantidad de emails que fallaron |
| `message` | string | Mensaje descriptivo del resultado |

### Response 400 Bad Request

```json
{
  "error": "VALIDATION_ERROR",
  "message": "customerIds es requerido y debe contener al menos un cliente"
}
```

### Response 500 Internal Server Error

```json
{
  "success": false,
  "sentCount": 2,
  "failedCount": 1,
  "message": "Algunos emails no pudieron ser enviados"
}
```

### Consideraciones de Implementación

1. **Validaciones:**
   - `customerIds` no debe estar vacío
   - `subject` no debe estar vacío y máximo 200 caracteres
   - `message` no debe estar vacío
   - Los clientes deben pertenecer al tenant actual (verificar tenantId)
   - Los clientes deben tener email válido

2. **Envío de Emails:**
   - Usar un servicio de email (JavaMailSender, SendGrid, AWS SES, etc.)
   - El email debe ser HTML formateado (convertir saltos de línea `\n` a `<br>`)
   - Incluir el nombre del tenant en el email
   - Personalizar el email con el nombre del cliente si es posible

3. **Template de Email (sugerido):**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
       .content { padding: 20px; background-color: #f9fafb; }
       .footer { padding: 10px; text-align: center; font-size: 12px; color: #6b7280; }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h2>{{tenantName}}</h2>
       </div>
       <div class="content">
         <p>Hola {{customerName}},</p>
         <p>{{message}}</p>
       </div>
       <div class="footer">
         <p>Este es un email promocional de {{tenantName}}</p>
       </div>
     </div>
   </body>
   </html>
   ```

4. **Manejo de Errores:**
   - Si algún email falla, continuar con el resto
   - Registrar los errores en logs
   - Devolver el conteo de exitosos y fallidos

5. **Performance:**
   - Si la lista es muy grande (>50 clientes), considerar:
     - Envío asíncrono
     - Cola de mensajes (RabbitMQ, Kafka, etc.)
     - Rate limiting para evitar bloqueos del proveedor de email

6. **Auditoría (opcional pero recomendado):**
   - Guardar registro de emails enviados en la BD
   - Tabla sugerida: `promotional_emails`
     - id
     - tenant_id
     - sent_by (usuario que envió)
     - subject
     - message
     - recipient_count
     - sent_count
     - failed_count
     - sent_at

### Ejemplo de Implementación Java (Service)

```java
@Service
public class PromotionService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private CustomerRepository customerRepository;

    public PromotionalEmailResponse sendPromotionalEmail(PromotionalEmailRequest request, String tenantId) {
        // Validaciones
        if (request.getCustomerIds() == null || request.getCustomerIds().isEmpty()) {
            throw new ValidationException("customerIds es requerido");
        }

        // Obtener clientes
        List<Customer> customers = customerRepository.findByIdInAndTenantId(
            request.getCustomerIds(),
            tenantId
        );

        int sentCount = 0;
        int failedCount = 0;

        // Enviar emails
        for (Customer customer : customers) {
            try {
                if (customer.getEmail() != null && !customer.getEmail().isEmpty()) {
                    sendEmail(customer, request.getSubject(), request.getMessage(), tenantId);
                    sentCount++;
                } else {
                    failedCount++;
                }
            } catch (Exception e) {
                log.error("Error sending email to customer: " + customer.getId(), e);
                failedCount++;
            }
        }

        return new PromotionalEmailResponse(
            failedCount == 0,
            sentCount,
            failedCount,
            failedCount == 0 ? "Emails enviados exitosamente" : "Algunos emails no pudieron ser enviados"
        );
    }

    private void sendEmail(Customer customer, String subject, String message, String tenantId) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String htmlMsg = buildEmailTemplate(customer.getName(), message, tenantId);

        helper.setTo(customer.getEmail());
        helper.setSubject(subject);
        helper.setText(htmlMsg, true);
        helper.setFrom("noreply@mylogistics.com");

        mailSender.send(mimeMessage);
    }
}
```

---

## Resumen de Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/customers/with-last-order` | GET | Obtiene clientes con información del último pedido, filtrado por días de inactividad |
| `/api/promotions/send-email` | POST | Envía email promocional a lista de clientes |

## Notas Finales

1. **Seguridad:** Ambos endpoints deben verificar que el usuario pertenece al tenant y tiene los permisos necesarios
2. **Rate Limiting:** Considera implementar rate limiting para evitar abuso del endpoint de emails
3. **Logs:** Registra todas las operaciones para auditoría
4. **Testing:** Asegúrate de testear con diferentes cantidades de clientes y diferentes períodos de inactividad

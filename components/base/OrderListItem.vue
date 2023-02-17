<script lang="ts" setup>
import { Order } from '@/models/order'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineProps } from 'vue'
import OrderActions from './order/OrderActions.vue'
import OrderDates from './order/OrderDates.vue'
import OrderItemCounter from './order/OrderItemCounter.vue'
import OrderStatus from './order/OrderStatus.vue'
import OrderTitle from './order/OrderTitle.vue'
import OrderTotalAmount from './order/OrderTotalAmount.vue'
import OrderType from './order/OrderType.vue'

defineProps<{
  order: Order
}>()
</script>

<template>
  <div class="order-grid grid items-center justify-items-start gap-4">
    <OrderType :type="order.supplier"></OrderType>
    <div class="flex flex-col">
      <OrderTitle class="pb-2" :order="order"></OrderTitle>
      <OrderDates :order="order"></OrderDates>
    </div>
    <OrderStatus class="justify-self-center 2xl:justify-self-start" :order="order"></OrderStatus>
    <OrderItemCounter
      class="justify-self-end"
      :number-of-order-items="order.orderPositionCount"
    ></OrderItemCounter>
    <OrderTotalAmount class="justify-self-end" :amount="order.totalAmount"></OrderTotalAmount>
    <OrderActions class="justify-self-center" :order="order"></OrderActions>
    <div class="arrow justify-self-end px-4">
      <font-awesome-icon
        class="icon text-gray-200 hover:text-primary"
        size="2x"
        :icon="['fal', 'angle-right']"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-grid {
  grid-template-columns:
    [type] 0.5fr
    [details] 1fr
    [status] minmax(40px, auto)
    [itemCounter] minmax(130px, 1fr)
    [totalAmount] minmax(150px, 1fr)
    [actions] 1fr
    [arrow] 40px;
}

@media screen and (min-width: 1536px) {
  .order-grid {
    grid-template-columns:
      [type] minmax(180px, 1fr)
      [details] 1.5fr
      [status] minmax(120px, auto)
      [itemCounter] minmax(130px, 1fr)
      [totalAmount] minmax(150px, 1fr)
      [actions] 1fr
      [arrow] 40px;
  }
}
</style>

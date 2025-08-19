<template>
  <div>
    <div className="max-w-2xl mx-auto ">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Invoice</h1>
          <p className="text-gray-600">#{{ sale.no }}</p>
        </div>
        <!-- <div className="text-right">
          <p className="font-bold">{{ sale. }}</p>
          <p className="text-gray-600">123 Business St, City, Country</p>
          <p className="text-gray-600">contact@yourcompany.com</p>
        </div> -->
      </div>

      <div className="mb-8" v-if="sale.customer">
        <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
        <p>{{ sale.customer?.name }}</p>
        <p>{{ sale.customer?.phone }}</p>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Quantity</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <!-- {invoiceItems.map((item, index) => (
          <InvoiceItem key={index} {...item} />
          ))} -->

          <tr className="border-b" v-for="item in sale.items">
            <td className="py-2">{{ item.name }}</td>
            <td className="py-2 text-right">{{ item.qty }}</td>
            <td className="py-2 text-right">{{ item.price }}</td>
            <td className="py-2 text-right">{{ (item.qty! * item.price!).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="text-right">
          <p className="mb-2"><span className="font-semibold">Discount:</span> {{ sale.discount }}</p>
          <p className="mb-2"><span className="font-semibold">Tax:</span> {{ sale.tax }}</p>
          <p className="text-xl font-bold">Total: ${{ sale.total }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Sale } from '~/models';


defineProps<{ sale: Sale }>()

</script>

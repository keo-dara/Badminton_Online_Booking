<template>
  <div>
    <!-- Popup Checkout Form -->
    <div id="aba_main_modal" class="aba-modal">
      <!-- Modal content -->
      <div class="aba-modal-content">
        <form method="POST" target="aba_webservice" :action="apiUrl" id="aba_merchant_request">
          <input type="hidden" name="hash" :value="hash" id="hash" />
          <input type="hidden" name="tran_id" :value="transactionId" id="tran_id" />
          <input type="hidden" name="amount" :value="amount" id="amount" />
          <input type="hidden" name="firstname" :value="firstName" />
          <input type="hidden" name="lastname" :value="lastName" />
          <input type="hidden" name="phone" :value="phone" />
          <input type="hidden" name="email" :value="email" />
          <input type="hidden" name="req_time" :value="reqTime" />
          <input type="hidden" name="merchant_id" :value="merchantId" />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiUrl: 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase',
      hash: '16MuEeYQeas3Pb/th/oc2LH9Z17vnzX+cPa+Imb8GqcfbaJhUzG7NHj8mNCAxLtIQ5B5rLel4GU0mqOhA4wCIw==',
      transactionId: Date.now().toString(),
      amount: '0.01',
      firstName: 'Kriya',
      lastName: 'Bour',
      phone: '+855978719172',
      email: 'kriya.bour@ababank.com',
      reqTime: Date.now().toString(),
      merchantId: 'vsmashbadmintonclub',
      paymentOption: 'abapay_khqr'
    };
  },
  methods: {
    checkout() {
      document.querySelector('#aba_merchant_request').append(document.querySelector(".payment_option:checked"));
      AbaPayway.checkout();
    }
  },
};
</script>
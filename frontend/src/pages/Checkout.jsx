import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Tag, Check, X } from "lucide-react";

const Checkout = () => {
  const { totalPrice, axios, navigate, fetchCartData } = useContext(AppContext);
  const [searchParams] = useSearchParams();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay at Canteen");

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(totalPrice);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Handle error query params from eSewa redirect
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "payment_failed") {
      toast.error("Online payment failed or was cancelled.");
    } else if (error === "server_error") {
      toast.error("Server error processing payment.");
    }
  }, [searchParams]);

  useEffect(() => {
    setFinalTotal(totalPrice - discountAmount);
  }, [totalPrice, discountAmount]);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    try {
      setLoadingPromo(true);
      const { data } = await axios.post("/api/promo/apply", {
        code: promoCodeInput,
        cartTotal: totalPrice,
      });

      if (data.success) {
        toast.success(data.message);
        setAppliedPromo(data.promoCode);
        setDiscountAmount(data.discountAmount);
        setFinalTotal(data.finalAmount);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid promo code");
    } finally {
      setLoadingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setFinalTotal(totalPrice);
    setPromoCodeInput("");
    toast.success("Promo code removed");
  };

  const handleCheckout = async () => {
    // 🛠️ Optional: Address is no longer strictly required, use default if empty
    const finalAddress = address.trim() !== "" ? address : "No remarks provided";

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setLoadingCheckout(true);

      // --- FLOW A: ONLINE PAYMENT (eSewa) ---
      if (paymentMethod === "Online Payment") {
        const transactionUuid = `TXN-${Date.now()}`;

        const { data } = await axios.post("/api/payment/init-esewa", {
          amount: finalTotal,
          transactionUuid,
          promoCode: appliedPromo,
          address: finalAddress, // 👈 Sends fallback if empty
        });

        if (data.success && data.paymentPayload) {
          const { paymentPayload } = data;

          const form = document.createElement("form");
          form.method = "POST";
          form.action = paymentPayload.url;

          Object.keys(paymentPayload).forEach((key) => {
            if (key !== "url") {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = paymentPayload[key];
              form.appendChild(input);
            }
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          toast.error(data.message || "Failed to initiate online payment");
          setLoadingCheckout(false);
        }
        return;
      }

      // --- FLOW B: PAY AT CANTEEN ---
      const { data } = await axios.post("/api/order/place", {
        address: finalAddress, // 👈 Sends fallback if empty
        paymentMethod,
        promoCode: appliedPromo,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/my-orders");
        fetchCartData();
      } else {
        toast.error(data.message);
        setLoadingCheckout(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white shadow-lg rounded-2xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Remarks / Table No</h2>
          <textarea
            rows={4}
            value={address}
            placeholder="Enter Delivery Remarks or Table Number"
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm text-black focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
          ></textarea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
            <Tag size={18} /> Have a Promo Code?
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCodeInput}
              disabled={appliedPromo !== null}
              placeholder="Enter code"
              onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase text-black disabled:bg-gray-100"
            />
            {appliedPromo ? (
              <button
                type="button"
                onClick={handleRemovePromo}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-1 cursor-pointer"
              >
                <X size={16} /> Remove
              </button>
            ) : (
              <button
                type="button"
                disabled={loadingPromo}
                onClick={handleApplyPromo}
                className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
              >
                {loadingPromo ? "Applying..." : "Apply"}
              </button>
            )}
          </div>
          {appliedPromo && (
            <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
              <Check size={14} /> Promo code &quot;{appliedPromo}&quot; applied successfully!
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Order Summary</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-2">
            <p className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>Rs. {totalPrice}</span>
            </p>
            {discountAmount > 0 && (
              <p className="flex justify-between text-sm text-green-600 font-medium">
                <span>Discount ({appliedPromo}):</span>
                <span>- Rs. {discountAmount}</span>
              </p>
            )}
            <hr className="border-gray-200 my-1" />
            <p className="flex justify-between text-lg font-bold text-gray-800">
              <span>Total Amount:</span>
              <span className="text-green-600">Rs. {finalTotal}</span>
            </p>
          </div>

          <h3 className="text-lg font-medium mb-2 text-gray-800">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="Pay at Canteen"
                checked={paymentMethod === "Pay at Canteen"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Pay at Canteen</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="Online Payment"
                checked={paymentMethod === "Online Payment"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Online Payment (eSewa Test)</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loadingCheckout}
          className="mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium cursor-pointer w-full disabled:opacity-50"
        >
          {loadingCheckout ? "Processing..." : `Confirm Order (Rs. ${finalTotal})`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
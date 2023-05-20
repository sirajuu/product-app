import React, { useState } from "react";

const Discount = () => {
    const catalog = {
        "PEN": 20,
        "PENCIL": 40,
        "ERASER": 50,
    };

    const discountRules = {
        flat_10_discount: { type: "cart_total", amount: 10, threshold: 200 },
        bulk_5_discount: { type: "product_quantity", percentage: 5, threshold: 10 },
        bulk_10_discount: { type: "total_quantity", percentage: 10, threshold: 20 },
        tiered_50_discount: {
            type: "tiered_quantity",
            percentage: 50,
            total_threshold: 30,
            product_threshold: 15,
        },
    };

    const [quantities, setQuantities] = useState({});
    const [giftWrapPreferences, setGiftWrapPreferences] = useState({});
    const [subtotal, setSubtotal] = useState(0);
    const [discount, setDiscount] = useState({ name: "", amount: 0 });
    const [shippingFee, setShippingFee] = useState(0);
    const [giftWrapFee, setGiftWrapFee] = useState(0);
    const [total, setTotal] = useState(0);

    // Calculate discount amount
    const calculateDiscount = (subtotal) => {
        let maxDiscount = { name: "", amount: 0 };

        // Check for each discount rule
        for (const [ruleName, rule] of Object.entries(discountRules)) {
            const { type, amount, threshold, percentage, total_threshold, product_threshold } = rule;

            if (type === "cart_total" && subtotal > threshold) {
                maxDiscount = amount > maxDiscount.amount ? { name: ruleName, amount } : maxDiscount;
            }
            else if (type === "product_quantity") {
                const exceedThreshold = Object.values(quantities).some(quantity => quantity > threshold);
                if (exceedThreshold) {
                    const ruleAmount = (subtotal * percentage) / 100;
                    maxDiscount = ruleAmount > maxDiscount.amount ? { name: ruleName, amount: ruleAmount } : maxDiscount;
                }
            }
            else if (type === "total_quantity" && Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0) > threshold) {
                const ruleAmount = (subtotal * percentage) / 100;
                maxDiscount = ruleAmount > maxDiscount.amount ? { name: ruleName, amount: ruleAmount } : maxDiscount;
            }
            else if (type === "tiered_quantity") {
                const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
                const exceedTotalThreshold = totalQuantity > total_threshold;
                const exceedProductThreshold = Object.values(quantities).some(quantity => quantity > product_threshold);

                if (exceedTotalThreshold && exceedProductThreshold) {
                    const excessQuantity = Math.max(0, totalQuantity - total_threshold);
                    const ruleAmount = (catalog["Product C"] * product_threshold * excessQuantity * percentage) / 100;
                    maxDiscount = ruleAmount > maxDiscount.amount ? { name: ruleName, amount: ruleAmount } : maxDiscount;
                }
            }
        }

        return maxDiscount;
    };

    // Calculate fees
    const calculateFees = () => {
        const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
        const numPackages = Math.ceil(totalQuantity / 10);
        const shippingFee = numPackages * 5;
        const giftWrapFee = totalQuantity * 1;

        setShippingFee(shippingFee);
        setGiftWrapFee(giftWrapFee);
    };

    // Calculate the total
    const calculateTotal = () => {
        const appliedDiscount = calculateDiscount(subtotal);
        const total = subtotal - appliedDiscount.amount + shippingFee + giftWrapFee;

        setDiscount(appliedDiscount);
        setTotal(total);
    };

    // Handle quantity change
    const handleQuantityChange = (product, quantity) => {
        const updatedQuantities = { ...quantities, [product]: quantity };
        setQuantities(updatedQuantities);
    };

    // Handle gift wrap preference change
    const handleGiftWrapPreferenceChange = (product, isGiftWrap) => {
        const updatedGiftWrapPreferences = { ...giftWrapPreferences, [product]: isGiftWrap };
        setGiftWrapPreferences(updatedGiftWrapPreferences);
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        const productTotals = calculateTotals();
        setSubtotal(Object.values(productTotals).reduce((sum, total) => sum + total, 0));
        calculateFees();
    };

    // Calculate total amount for each product
    const calculateTotals = () => {
        const productTotals = {};

        for (const [product, quantity] of Object.entries(quantities)) {
            productTotals[product] = catalog[product] * quantity;
        }

        return productTotals;
    };

    return (
        <div className='container text-center' style={{ marginTop: '150px' }}>

            <div className="row">


                <div className=" col-lg-6 text-center border p-3 rounded  me-1">




                    <form onSubmit={handleSubmit}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Gift Wrap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(catalog).map((product) => (
                                    <tr key={product}>
                                        <td>{product}</td>
                                        <td>
                                            <input

                                                type="number"
                                                min="0"
                                                value={quantities[product] || ""}
                                                onChange={(e) =>
                                                    handleQuantityChange(product, parseInt(e.target.value))
                                                }
                                            />
                                        </td>
                                        <td>
                                            <input

                                                type="checkbox"
                                                checked={giftWrapPreferences[product] || false}
                                                onChange={(e) =>
                                                    handleGiftWrapPreferenceChange(product, e.target.checked)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button class="btn btn-primary" type="submit">Calculate</button>
                    </form>
                </div>

                <div style={{ marginTop: '' }} className="col-lg-4 ms-auto p-3 rounded">
                    <div>
                        <h1><span className="fw-bolder fs-2 text-danger">Sub Total:${subtotal}</span></h1>
                        <h1>Discount: (${discount.amount})</h1>
                        <p>Shipping Fee: ${shippingFee}</p>
                        <p>Gift Wrap Fee: ${giftWrapFee}</p>
                        <p>Total: ${subtotal}</p>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary"
                                type="button">Proceed to Buy</button>
                        </div>
                    </div>


                </div>
            </div>
        </div>


    );
};

export default Discount;

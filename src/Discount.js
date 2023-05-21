import React, { useEffect, useState } from "react";

const Discount = () => {
    const catalog = {
        "PRODUCT A $20": 20,
        "PRODUCT B $40": 40,
        "PRODUCT C $50": 50,
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
    const [subtotal, setSubtotal] = useState(0);
    const [netTotal, setNetTotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [giftWrapFee, setGiftWrapFee] = useState(0);

    useEffect(() => {
        calculateFees();
    }, [subtotal]);

    const calculateFees = () => {
        const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
        const numPackages = Math.ceil(totalQuantity / 10);
        const shippingFee = numPackages * 5;
        const giftWrapFee = totalQuantity * 1;

        let netTotal = subtotal + shippingFee + giftWrapFee;

        if (document.getElementsByName('flat10Discount')[0].checked && netTotal > 200) {
            netTotal -= 10;
        }

        if (document.getElementsByName('bulk5Discount')[0].checked) {
            const exceedingProducts = Object.keys(quantities).filter(
                (product) => quantities[product] > 10
            );

            exceedingProducts.forEach((product) => {
                netTotal -= catalog[product] * quantities[product] * 0.05;
            });
        }

        if (document.getElementsByName('bulk10Discount')[0].checked && totalQuantity > 20) {
            netTotal *= 0.9;
        }

        if (
            document.getElementsByName('tiered50Discount')[0].checked &&
            totalQuantity > 30
        ) {
            const exceedingProducts = Object.keys(quantities).filter(
                (product) => quantities[product] > 15
            );

            exceedingProducts.forEach((product) => {
                const quantityAbove15 = quantities[product] - 15;
                netTotal -= catalog[product] * quantityAbove15 * 0.5;
            });
        }

        setNetTotal(netTotal);
        setShippingFee(shippingFee);
        setGiftWrapFee(giftWrapFee);
    };

    const handleQuantityChange = (product, quantity) => {
        const updatedQuantities = { ...quantities, [product]: quantity };
        setQuantities(updatedQuantities);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const productTotals = calculateTotals();
        setSubtotal(Object.values(productTotals).reduce((sum, total) => sum + total, 0));
        calculateFees();
    };

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
                <div className="col-lg-6 text-center border p-3 rounded me-1">
                    <form onSubmit={handleSubmit}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn btn-primary" type="submit">Calculate</button>
                    </form>
                </div>

                <div style={{ marginTop: '' }} className="col-lg-4 ms-auto p-3 rounded">
                    <div>
                        <h1><span className="fw-bolder fs-2 text-danger">Sub Total: ${subtotal}</span></h1>

                        <p>Shipping Fee: ${shippingFee} | Gift Wrap Fee: ${giftWrapFee}</p>
                        <p>
                            ( If cart total exceeds $200)
                        </p>
                        <h5>
                            <input type="checkbox" name="flat10Discount" onChange={calculateFees} />
                            Apply Flat $10 Discount
                        </h5>
                        <p>
                            ( If quantity of any single product exceeds 10 units)
                        </p>
                        <h5>
                            <input type="checkbox" name="bulk5Discount" onChange={calculateFees} />
                            Apply 5% Bulk Discount
                        </h5>
                        <p>
                            ( If total quantity exceeds 20 units, apply a 10% discount on the cart total.)
                        </p>
                        <h5>
                            <input type="checkbox" name="bulk10Discount" onChange={calculateFees} />
                            Apply 10% Bulk Discount
                        </h5>
                        <p>
                            ( If total quantity exceeds 30 units & any single product quantity greater than 15)
                        </p>
                        <h5>
                            <input type="checkbox" name="tiered50Discount" onChange={calculateFees} />
                            Apply Tiered 50% Discount
                        </h5>
                        <h1>Grand Total: ${netTotal}</h1>
                        <div className="d-grid gap-2">
                            <button className="btn btn-primary" type="button">Proceed to Buy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Discount;

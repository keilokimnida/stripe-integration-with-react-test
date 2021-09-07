import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { getToken } from '../utilities/localStorageUtils';
import config from '../config/config';
import jwt_decode from "jwt-decode";
import Title from '../common/Title';
import Header from '../layout/Header';
import { NavLink, useHistory } from 'react-router-dom';
import LoggedOut from '../common/LoggedOut';
import CartItem from '../common/CartItem';
import Skeleton from '@material-ui/lab/Skeleton';
import Spinner from 'react-bootstrap/Spinner'
import {
    CardElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { PageStatusEnum } from '../config/enums';


const Checkout: React.FC = () => {
    interface LooseObject {
        [key: string]: any
    }
    interface OrderSummaryInterface {
        grandTotal: number | null;
        subTotal: number | null;
    }
    enum PageStatusEnum {
        ACTIVE = "Active",
        LOADING = "Loading",
        ERROR = "Error"
    }


    const history = useHistory();
    const toastTiming = config.toastTiming;
    const token: string | null = getToken();

    // State declarations
    const [cartArr, setCartArr] = useState<[]>([]);
    const [orderSummary, setOrderSummary] = useState<OrderSummaryInterface>({
        grandTotal: null,
        subTotal: null
    });
    const [rerender, setRerender] = useState<boolean>(false);
    const [pageStatus, setPageStatus] = useState<PageStatusEnum>(PageStatusEnum.LOADING);
    const [saveCard, setSaveCard] = useState<boolean>(false);

    // Stripe
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentDisabled, setPaymentDisabled] = useState(true);
    const [clientSecret, setClientSecret] = useState('');
    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        let componentMounted = true;

        (async () => {
            try {

                // Get cart data based on account ID
                const cartResponse = await axios.get(`${config.baseUrl}/cart`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const cartData = cartResponse.data;
                if (componentMounted) {
                    if (cartData.length !== 0) {
                        let subTotal = 0, grandTotal = 0;
                        // set cart array here
                        setCartArr(() => {
                            return cartData.map((cartDataObj: LooseObject, mapIndex: number) => {
                                subTotal += cartDataObj.quantity * parseFloat(cartDataObj.product.product_price);
                                return {
                                    quantity: cartDataObj.quantity,
                                    name: cartDataObj.product.product_name,
                                    unitPrice: parseFloat(cartDataObj.product.product_price),
                                    totalPrice: (() => {
                                        return cartDataObj.quantity * parseFloat(cartDataObj.product.product_price);
                                    })(),
                                    productID: cartDataObj.product.product_id
                                }
                            });
                        });
                        setOrderSummary(() => {
                            grandTotal = subTotal;
                            return {
                                grandTotal,
                                subTotal
                            }
                        });

                        // // Check if user has any payment types stored already
                        // const paymentMethods = await axios.get(`${config.baseUrl}/check-payment-methods`, {
                        //     headers: {
                        //         'Authorization': `Bearer ${token}`
                        //     }
                        // });

                        // const paymentMethodsData = paymentMethods.data;

                        // console.log(paymentMethodsData);
                        // // If there's no current payment methods
                        // if (paymentMethodsData === "") {

                        // }
                    } else {
                        setCartArr(() => []);
                    }

                    setTimeout(() => {
                        setPageStatus(() => PageStatusEnum.ACTIVE) // set page status to active
                    }, 300);
                }
            } catch (error) {
                console.log(error);
                if (componentMounted) {
                    setTimeout(() => {
                        setPageStatus(() => PageStatusEnum.ACTIVE) // set page status to active
                    }, 300);
                }
            }
        })();

        return (() => {
            componentMounted = false;
        });

    }, [rerender]);


    const cardStyle = {
        style: {
            base: {
                color: "#32325d",
                fontFamily: 'Arial, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#32325d"
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        }
    };

    // Handlers
    const handleCardInputChange = async (event: any) => {
        // Listen for changes in the CardElement
        // and display any errors as the customer types their card details
        if (event.complete) {
            setPaymentDisabled(false);
        } else {
            setPaymentDisabled(true);
        }
       
        setPaymentError(event.error ? event.error.message : "");
    };

    const handleFormSubmit = async (event: any) => {
        event.preventDefault();
        console.log("test");
        setPaymentProcessing(true);
        setTimeout(() => {
            setPaymentProcessing(false);
        }, 3000);
        // const payload = await stripe!.confirmCardPayment(clientSecret, {
        //     payment_method: {
        //         card: elements!.getElement(CardElement)!
        //     }
        // });

        // if (payload.error) {
        //     setPaymentError(`Payment failed ${payload.error.message}`);
        //     setPaymentProcessing(false);
        // } else {
        //     setPaymentError(null);
        //     setPaymentProcessing(false);
        // }
    };

    const handleInputChange = () => {
        
    };

    return (
        <>
            <div className="l-Main">
                <ToastContainer
                    position="top-center"
                    autoClose={toastTiming}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <Title title="Checkout" />
                <Header rerender={rerender} />
                <div className="c-Checkout">
                    {
                        cartArr.length === 0 ?
                            // Cart is empty
                            <div className="c-Checkout__Empty">
                                <h1>Your cart is empty!</h1>
                                <NavLink to="/products">Start adding products!</NavLink>
                            </div>
                            :
                            // Checkout
                            <>
                                {/* Checkout Form */}
                                <form className="c-Checkout__Left" onSubmit={handleFormSubmit}>
                                    <h1>Checkout Details</h1>

                                    <div className="c-Left__Billing-info">
                                        <h2>Shipping & Billing Information</h2>
                                        <p>Not available.</p>
                                    </div>
                                    <div className="c-Left__Card-info">
                                        <h2>Payment Information</h2>
                                        <CardElement options={cardStyle} onChange={handleCardInputChange} />
                                        {/* Show any error that happens when processing the payment */}
                                        {paymentError && (
                                            <div className="card-error" role="alert">
                                                {paymentError}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        disabled={paymentProcessing || paymentDisabled}
                                        className="c-Btn"
                                        type="submit"
                                    >
                                        {paymentProcessing ? (
                                            <>
                                             <span> Processing Payment...</span>
                                             <Spinner animation="border" role="status"/>
                                             </>
                                        ) : (
                                            <>
                                                Pay S${orderSummary.grandTotal ? orderSummary.grandTotal.toFixed(2) : "Error"}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        disabled={paymentProcessing}
                                        className="c-Btn"
                                        onClick={() => history.push("/cart")}
                                        type="button"
                                    >Back to Cart
                                    </button>
                                </form>
                                {/* Summary */}
                                <div className="c-Checkout__Right">
                                    <h1>Summary</h1>
                                    <div className="l-Checkout__Checkout-card">
                                        <div className="c-Checkout-card">
                                            <div className="c-Checkout-card__Info">
                                                {
                                                    cartArr.map((data: LooseObject, index: number) => (
                                                        <div key={index}>
                                                            <div className="c-Checkout-card__Item-sub-total">
                                                                <p>{data.quantity} x {data.name}</p>
                                                                <h2>S${data.totalPrice.toFixed(2)}</h2>
                                                            </div>
                                                            <hr />
                                                        </div>
                                                    ))
                                                }
                                                <div className="c-Checkout-card__Sub-total">
                                                    <h1>Sub Total</h1>
                                                    <h2>S${orderSummary.subTotal ? orderSummary.subTotal!.toFixed(2) : "Error!"}</h2>
                                                </div>
                                                <div className="c-Checkout-card__Grand-total">
                                                    <h1>Grand Total</h1>
                                                    <h2>S${orderSummary.grandTotal ? orderSummary.grandTotal!.toFixed(2) : "Error!"}</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                    }
                </div>
            </div>
        </>

    )
}

export default Checkout;
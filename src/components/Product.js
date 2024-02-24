import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Rating from "./Rating";
import { FOUR_DAYS, NO_STOCK } from "../constants/common";
import { isObjectEmpty } from "../helpers/object-utils";
import close from "../assets/close.svg";

const Product = ({ item, provider, account, dappazon, togglePop }) => {
  const [order, setOrder] = useState(null);
  const [hasBought, setHasBought] = useState(false);

  const fetchDetails = async () => {
    const events = await dappazon.queryFilter("Buy");
    const order = events.find(
      (e) =>
        e.args.buyer === account &&
        e.args.itemId.toString() === item.id.toString()
    );
    if (isObjectEmpty(order)) return;
    const currentOrder = await dappazon.orders(account, item.id);
    setOrder(currentOrder);
  };

  const buyHandler = async () => {
    const signer = await provider.getSigner();
    try {
      let transaction = await dappazon
        .connect(signer)
        .buy(item.id, { value: item.price });
      await transaction.wait();

      setHasBought(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [hasBought]);

  return (
    <div className="product">
      <div className="product__details">
        <img className="product__image" src={item.image} alt={item.name} />
        <div className="product__overview">
          <h1>{item.name}</h1>
          <Rating value={item.rating} />
          <hr />
          <p>{item.address}</p>
          <h2>{ethers.formatUnits(item.price.toString(), "ether")} ETH</h2>
          <hr />
          <h2>Overview</h2>
          <p>
            {item.description}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
        </div>
        <div className="product__order">
          <h1>{ethers.formatUnits(item.price.toString(), "ether")} ETH</h1>
          <p>
            FREE Delivery <br />
            <strong>
              {new Date(Date.now() + FOUR_DAYS).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
          </p>

          {item.stock > NO_STOCK ? <p>In Stock</p> : <p>Out of Stock</p>}

          <button
            className="product__buy"
            onClick={buyHandler}
            disabled={!item.stock}
          >
            Buy Now
          </button>

          <p>
            <small>Ships from</small> Dappazon
          </p>
          <p>
            <small>Sold by</small> Dappazon
          </p>

          {order && (
            <div className="product_bought">
              Item bought on <br />
              <strong>
                {new Date(
                  Number(order.time.toString()) * 1000
                ).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>
            </div>
          )}
        </div>
        <button className="product__close" onClick={togglePop}>
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Product;

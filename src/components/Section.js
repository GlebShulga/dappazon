import { ethers } from "ethers";

// Components
import Rating from "./Rating";

const Section = ({ title, items, togglePop }) => {
  return (
    <div className="cards__section">
      <h3 id={title}>{title}</h3>
      <hr />
      <div className="cards">
        {items.map((item) => (
          <div className="card" key={item.id} onClick={() => togglePop(item)}>
            <img className="card__image" src={item.image} alt={item.name} />
            <div className="card__info">
              <h4>{item.name}</h4>
              <Rating value={item.rating} />
              <p>{ethers.formatUnits(item.price.toString(), "ether")} ETH</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Section;

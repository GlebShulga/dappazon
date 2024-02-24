import { RATING_INCREMENT } from "../constants/common";
import star_regular from "../assets/star-regular.svg";
import star_solid from "../assets/star-solid.svg";

const Rating = ({ value }) => {
  return (
    <div className="rating">
      {[...Array(5)].map((_, i) => (
        <img
          key={i}
          src={value >= i + RATING_INCREMENT ? star_solid : star_regular}
          width="20px"
          height="20px"
          alt="Star"
        />
      ))}
    </div>
  );
};

export default Rating;

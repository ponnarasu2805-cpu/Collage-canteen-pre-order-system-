import { Plus } from "lucide-react";

export default function FoodCard({item, onAdd}) {
  return (
    <article className="food-card">
      <div className="food-art">{item.emoji}</div>
      <div className="food-content">
        <span className="tag">{item.popular ? "🔥 Popular" : `● ${item.category}`}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="food-bottom">
          <strong>₹{item.price}</strong>
          <button onClick={()=>onAdd(item)} aria-label={`Add ${item.name}`}><Plus size={19}/></button>
        </div>
      </div>
    </article>
  );
}

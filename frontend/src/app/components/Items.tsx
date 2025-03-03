'use client'

import useItems from "../hooks/useItems";

export default function Items() {
  const { items, addNewItem } = useItems()

  return <div>
    {items.map(item => <div key={item.id}>{item.name}{item.price}{item.description}</div>)}
    <div onClick={() => { addNewItem({ name: "addtest", price: "0.0", description: "testing adding" }) }}>Add Item</div>
  </div>
}
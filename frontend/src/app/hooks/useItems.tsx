'use client'

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../Providers";

type Item = {
  name: string,
  price: string,
  description: string,
}
export type ItemFromDatabase = Item & { id: string }

export default function useItems() {
  const [items, setItems] = useState<ItemFromDatabase[]>([])
  const { accessToken } = useAuth();

  const fetchItems = useCallback(async () => {
    if (!accessToken) {
      setItems([])
      return
    }
    const response = await fetch('http://localhost:8000/items', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },

    });
    if (!response.ok) throw new Error('Sign in failed');
    const { data } = await response.json();
    setItems(data);
  }, [accessToken])

  const addNewItem = useCallback(async (item: Item) => {
    if (!accessToken) {
      setItems([])
      return
    }
    const response = await fetch('http://localhost:8000/items', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(item)
    });
    if (!response.ok) throw new Error('Sign in failed');
    fetchItems()
  }, [accessToken, fetchItems])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { items, addNewItem }
}
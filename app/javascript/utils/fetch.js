const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

export const fetchUserState = async () => {
    const response = await fetch("/api/authenticate", {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        console.log('User is authenticated.', data);
        return data;
    }

    if (response.status === 401) {
        console.log('User is not logged in.');
    } else if (!response.ok) {
        throw new Error(`Could not fetch user state: ${response.statusText}`);
    }

    return response.json();
};


export const logoutUser = async () => {
    const response = await fetch("/api/logout", {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
    }

    return response;
};

export async function postTierList(tierList) {
    const { title, description, source, content_type, user_id, upvotes, downvotes } = tierList;

    const response = await fetch('/api/tier_lists', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            tier_list: {
                title,
                description,
                source,
                content_type,
                user_id,
                upvotes: Number(upvotes),
                downvotes: Number(downvotes),
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
}

export async function fetchTierList(id) {
    const response = await fetch(`/api/tier_lists/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching tier list: ${response.statusText}`);
    }

    const responseData = await response.json();
    return { ...responseData, tiers: responseData.tiers };
}

export async function updateTierList(id, updatedData) {
    const response = await fetch(`/api/tier_lists/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            tier_list: {
                ...updatedData
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Error updating tier list: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}

export async function updateTierListPosted(tierListId, posted) {
    const response = await fetch(`/api/tier_lists/${tierListId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            tier_list: {
                posted: posted
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function postTier(tier, tierListId, contentIds = []) {
    const response = await fetch('/api/tiers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            tier: {
                rank: tier.rank,
                tier_list_id: tierListId,
                content_ids: contentIds
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}


export async function createContent(contentData) {
    const response = await fetch('/api/contents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            content: contentData
        })
    });

    if (!response.ok) {
        throw new Error(`Error creating content: ${response.statusText}`);
    }

    return await response.json();
}

export async function updateTier(tierId, contentApiIds = []) {

    const contentIds = [];
    for (const apiId of contentApiIds) {
        const contentData = await fetchContentFromAPI(apiId);
        const newContent = await createContent(contentData);
        contentIds.push(newContent.id);
    }

    const response = await fetch(`/api/tiers/${tierId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            tier: {
                content_ids: contentIds
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function postInventory(tierListId, contentIds = []) {
    const response = await fetch('/api/inventories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            inventory: {
                tier_list_id: tierListId,
                content_ids: Array.isArray(contentIds) ? contentIds : [contentIds]
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function fetchInventory(tierListId) {
    const response = await fetch(`/api/tier_lists/${tierListId}/inventories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching inventory: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`Fetched Inventory: ${JSON.stringify(responseData)}`)
    return responseData;
}

async function updateInventory(tierListId, contentIds = []) {
    const response = await fetch(`/api/inventories/${tierListId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
        body: JSON.stringify({
            inventory: {
                tier_list_id: tierListId,
                content_ids: Array.isArray(contentIds) ? contentIds : [contentIds]
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Error updating inventory: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}

export async function fetchUserTierLists(userId) {
    const response = await fetch(`/api/tier_lists/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching user's tier lists: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}

export async function fetchPostedUserTierLists(userId) {
    const response = await fetch(`/api/tier_lists/user/${userId}/posted`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching posted tier lists: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}

export async function fetchUnpostedUserTierLists(userId) {
    const response = await fetch(`/api/tier_lists/user/${userId}/unposted`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching unposted tier lists: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}


export async function fetchRecentTierLists() {
    const response = await fetch(`/api/tier_lists/recent`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching recent tier lists: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}

export async function fetchPopularTierLists() {
    const response = await fetch(`/api/tier_lists/popular`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching popular tier lists: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}

export async function fetchHotTierLists() {
    const response = await fetch(`/api/tier_lists/hot`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching hot tier lists: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
}



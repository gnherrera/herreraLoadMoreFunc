import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';


const { width } = Dimensions.get('window');
const productsPerPage = 10;

const ProductListApp = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://fakestoreapi.com/products`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            setAllProducts(data);

            const firstBatch = data.slice(0, productsPerPage).map(item => ({
                ...item,
                _id: uuidv4(),
            }));
            setDisplayedProducts(firstBatch);
            setPageIndex(1);
        } catch (err) {
            setError(err);
        } finally {
            setTimeout(() => setLoading(false), 1500);
        }
    };

    useEffect(() => {
        fetchAllProducts();
    }, []);

    const loadMoreProducts = () => {
        if (loadingMore || loading || error) return;

        setLoadingMore(true);

        setTimeout(() => {
            const start = pageIndex * productsPerPage;
            const end = start + productsPerPage;

            let batch;
            if (start >= allProducts.length) {
                setPageIndex(1);
                batch = allProducts.slice(0, productsPerPage);
            } else {
                setPageIndex(prev => prev + 1);
                batch = allProducts.slice(start, end);
            }

            const batchWithNewIds = batch.map(item => ({
                ...item,
                _id: uuidv4(),
            }));

            setDisplayedProducts(prev => [...prev, ...batchWithNewIds]);
            setLoadingMore(false);
        }, 3000);
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>${item.price}</Text>
            </View>
        </View>
    );

    const ListFooterComponent = () => {
        if (loadingMore) {
            return (
                <View style={styles.footerContainer}>
                    <ActivityIndicator size="large" color="#f35100" />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            );
        }
        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error.message}</Text>
                    <TouchableOpacity onPress={fetchAllProducts}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
            <Image
          source={require('./assets/images/flashdeals.png')} 
          style={styles.headerImage}
        />
            <Text style={styles.headerText}>Shopee Flash Deals</Text>
        </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f35100" />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            ) : (
                <FlatList
                    data={displayedProducts}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    ListFooterComponent={ListFooterComponent}
                    onEndReached={loadMoreProducts}
                    onEndReachedThreshold={0.5}
                    numColumns={1}
                    contentContainerStyle={styles.flatListContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
},
header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f35100', 
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
},
headerImage: {
  width: 60,  
  height: 60, 
  resizeMode: 'contain', 
  marginRight: 10, 
},
image: {
    width: 30,  
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
    backgroundColor: '#f35100', 
    borderRadius: 5, 
},
headerText: {
    fontSize: 23.5,
    fontWeight: 'bold',
    color: '#fff',
    fontStyle: 'italic',
},
itemContainer: {
  flexDirection: 'row',
  padding: 12, 
  marginVertical: 6, 
  marginHorizontal: 10,
  backgroundColor: '#fff',
  borderRadius: 10, 
  borderWidth: 3,
  borderColor: '#f35100',
  shadowColor: '#f35100',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12, 
  shadowRadius: 6,
  elevation: 3, 
},
image: {
  width: 80, 
  height: 80,
  resizeMode: 'cover',
  borderRadius: 10, 
  backgroundColor: '#f1f1f1',
  marginRight: 15, 
  
},
infoContainer: {
  flex: 1,
  justifyContent: 'center',
  paddingVertical: 4, 
},
title: {
  fontSize: 16, 
  fontWeight: '600',
  color: '#333',
  marginBottom: 6, 
  lineHeight: 18, 
},
price: {
  fontSize: 16, 
  fontWeight: '700',
  color: '#f35100',
},
    footerContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#555',
        marginTop: 8,
    },
    errorContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    retryButtonText: {
        color: '#f35100',
        fontSize: 18,
        textDecorationLine: 'underline',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatListContent: {
        paddingBottom: 20,
    },
});

export default ProductListApp;

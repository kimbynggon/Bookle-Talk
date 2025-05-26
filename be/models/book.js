module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    published_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    translator: {
      type: DataTypes.STRING,
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avg: {  // 평균 평점
      type: DataTypes.DECIMAL(3, 2), // 평균 평점 (0.00 ~ 5.00)
      allowNull: true,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 5.0
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'books',
    timestamps: false
  });

  Book.associate = function(models) {
    Book.hasMany(models.Chat, { 
      foreignKey: 'book_id',
      as: 'chats'
    });
    
    Book.hasMany(models.Like, { 
      foreignKey: 'book_id',
      as: 'likes'
    });
    
    Book.hasMany(models.Bookmark, { 
      foreignKey: 'book_id',
      as: 'bookmarks'
    });
  };

  // 🌟 자동 평점 계산 기능 (Book 모델이 담당)
  Book.updateAverageRating = async function(bookId) {
    try {
      const Like = sequelize.models.Like;
      
      // 해당 책의 모든 평점을 가져와서 평균 계산
      const avgResult = await Like.findOne({
        where: { book_id: bookId },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']],
        raw: true
      });
      
      const averageRating = avgResult.average ? parseFloat(avgResult.average).toFixed(2) : 0.0;
      
      // Book 테이블의 avg 컬럼 업데이트
      await Book.update(
        { avg: averageRating },
        { where: { id: bookId } }
      );
      
      console.log(`📚 책 ID ${bookId}의 평균 평점이 ${averageRating}점으로 업데이트되었습니다.`);
      
      return averageRating;
      
    } catch (error) {
      console.error(`❌ 책 ID ${bookId}의 평점 업데이트 중 오류:`, error);
      throw error;
    }
  };

  // 특정 책의 평점 정보 조회 (인스턴스 메서드)
  Book.prototype.getRatingInfo = async function() {
    const Like = sequelize.models.Like;
    
    const ratingInfo = await Like.findAll({
      where: { book_id: this.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('rating')), 'total_count'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
        [sequelize.fn('MIN', sequelize.col('rating')), 'min_rating'],
        [sequelize.fn('MAX', sequelize.col('rating')), 'max_rating']
      ],
      raw: true
    });

    const ratingDistribution = await Like.findAll({
      where: { book_id: this.id },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('rating')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });

    return {
      book_title: this.title,
      current_avg: this.avg,
      total_ratings: parseInt(ratingInfo[0].total_count) || 0,
      calculated_avg: ratingInfo[0].average ? parseFloat(ratingInfo[0].average).toFixed(2) : 0.0,
      min_rating: ratingInfo[0].min_rating || 0,
      max_rating: ratingInfo[0].max_rating || 0,
      rating_distribution: ratingDistribution
    };
  };

  // 모든 책의 평점을 다시 계산 (배치 처리용)
  Book.recalculateAllRatings = async function() {
    try {
      console.log('🔄 모든 책의 평점을 다시 계산합니다...');
      
      const books = await Book.findAll({
        attributes: ['id', 'title']
      });

      let updatedCount = 0;
      for (const book of books) {
        await Book.updateAverageRating(book.id);
        updatedCount++;
      }

      console.log(`✅ 총 ${updatedCount}권의 책 평점이 업데이트되었습니다.`);
      return updatedCount;
      
    } catch (error) {
      console.error('❌ 전체 평점 재계산 중 오류:', error);
      throw error;
    }
  };

  return Book;
};
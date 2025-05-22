// utils/database.util.js
const { sequelize } = require('../models');
const queryInterface = sequelize.getQueryInterface();

/**
 * 모든 테이블을 생성하는 함수
 */
const createTables = async () => {
  try {
    console.log('데이터베이스 테이블 생성 시작...');

    // 사용자 테이블 생성
    await queryInterface.createTable('users', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: sequelize.Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      email: {
        type: sequelize.Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: sequelize.Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    });
    console.log('✅ 사용자 테이블 생성 완료');

    // 도서 테이블 생성
    await queryInterface.createTable('books', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: sequelize.Sequelize.STRING(255),
        allowNull: false
      },
      author: {
        type: sequelize.Sequelize.STRING(255)
      },
      published_year: {
        type: sequelize.Sequelize.INTEGER
      },
      isbn: {
        type: sequelize.Sequelize.STRING(20)
      },
      summary: {
        type: sequelize.Sequelize.TEXT
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    });
    console.log('✅ 도서 테이블 생성 완료');

    // 리뷰 테이블 생성
    await queryInterface.createTable('reviews', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rating: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true
      },
      comment: {
        type: sequelize.Sequelize.TEXT
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    });
    console.log('✅ 리뷰 테이블 생성 완료');

    // 좋아요 테이블 생성
    await queryInterface.createTable('likes', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      review_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reviews',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    });
    // 좋아요 고유 인덱스 생성
    await queryInterface.addIndex('likes', ['user_id', 'review_id'], {
      unique: true,
      name: 'likes_user_review_unique'
    });
    console.log('✅ 좋아요 테이블 생성 완료');

    // 북마크 테이블 생성
    await queryInterface.createTable('bookmarks', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    });
    // 북마크 고유 인덱스 생성
    await queryInterface.addIndex('bookmarks', ['user_id', 'book_id'], {
      unique: true,
      name: 'bookmarks_user_book_unique'
    });
    console.log('✅ 북마크 테이블 생성 완료');

    // 채팅 테이블 생성
    await queryInterface.createTable('chats', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      message: {
        type: sequelize.Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    });
    console.log('✅ 채팅 테이블 생성 완료');

    // 리뷰 댓글 테이블 생성
    await queryInterface.createTable('review_comments', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      review_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reviews',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parent_id: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'review_comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      content: {
        type: sequelize.Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    });
    console.log('✅ 리뷰 댓글 테이블 생성 완료');

    console.log('모든 테이블이 성공적으로 생성되었습니다! 🎉');
    return true;
  } catch (error) {
    console.error('테이블 생성 중 오류 발생:', error);
    return false;
  }
};

/**
 * 모든 테이블을 삭제하는 함수
 */
const dropTables = async () => {
  try {
    console.log('데이터베이스 테이블 삭제 시작...');
    
    // 순서대로 테이블 삭제 (외래 키 제약 조건 고려)
    await queryInterface.dropTable('review_comments', { cascade: true });
    await queryInterface.dropTable('chats', { cascade: true });
    await queryInterface.dropTable('bookmarks', { cascade: true });
    await queryInterface.dropTable('likes', { cascade: true });
    await queryInterface.dropTable('reviews', { cascade: true });
    await queryInterface.dropTable('books', { cascade: true });
    await queryInterface.dropTable('users', { cascade: true });
    
    console.log('모든 테이블이 성공적으로 삭제되었습니다! 🎉');
    return true;
  } catch (error) {
    console.error('테이블 삭제 중 오류 발생:', error);
    return false;
  }
};

/**
 * 데이터베이스를 초기화하는 함수 (모든 테이블 삭제 후 다시 생성)
 */
const resetDatabase = async () => {
  try {
    await dropTables();
    await createTables();
    console.log('데이터베이스가 초기화되었습니다! 🎉');
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
    return false;
  }
};

module.exports = {
  createTables,
  dropTables,
  resetDatabase
};
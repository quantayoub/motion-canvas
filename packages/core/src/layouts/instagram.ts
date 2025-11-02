import {BBox} from '../types/BBox';
import {Vector2} from '../types/Vector';
import {Layout, LayoutConfig} from './Layout';

/**
 * Instagram Reels layout configuration.
 *
 * @remarks
 * Based on 1080x1920 resolution with safe zones to avoid UI overlays.
 * - Top overlays: ~220px (Reels tab, camera icon)
 * - Bottom overlays: ~420-450px (profile, caption, like/comment/share buttons)
 * - Left margin: ~60px
 * - Right margin: ~120-170px (for button stack)
 */
function createInstagramLayoutConfig(): LayoutConfig {
  const width = 1080;
  const height = 1920;

  // Define safe margins based on Instagram Reels UI
  const topMargin = 220;
  const bottomMargin = 450;
  const leftMargin = 60;
  const rightMargin = 150;

  // Calculate safe content area
  const contentArea = new BBox(
    leftMargin,
    topMargin,
    width - leftMargin - rightMargin,
    height - topMargin - bottomMargin,
  );

  return {
    id: 'instagram',
    name: 'Instagram Reels',
    description:
      'Optimized for Instagram Reels (9:16). Safe zones prevent content from being obscured by UI elements.',
    defaultResolution: new Vector2(width, height),
    safeZone: {
      contentArea,
      margins: {
        top: topMargin,
        bottom: bottomMargin,
        left: leftMargin,
        right: rightMargin,
      },
    },
    overlay: {
      draw(ctx: CanvasRenderingContext2D, size: Vector2) {
        const scaleX = size.x / width;
        const scaleY = size.y / height;

        ctx.save();
        ctx.scale(scaleX, scaleY);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, topMargin);
        ctx.fillRect(0, height - bottomMargin, width, bottomMargin);

        const topBarY = 80;
        const plusIconSize = 60;
        const plusIconX = 70;
        const plusIconY = topBarY;
        const plusStrokeWidth = 6;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = plusStrokeWidth;
        ctx.lineCap = 'round';

        const plusIconCenterX = plusIconX;
        const plusIconCenterY = plusIconY;
        const crossLength = plusIconSize * 0.4;

        ctx.beginPath();
        ctx.moveTo(plusIconCenterX, plusIconCenterY - crossLength);
        ctx.lineTo(plusIconCenterX, plusIconCenterY + crossLength);
        ctx.moveTo(plusIconCenterX - crossLength, plusIconCenterY);
        ctx.lineTo(plusIconCenterX + crossLength, plusIconCenterY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font =
          'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Reels', width / 2, topBarY + 14);

        // Right column - Action buttons (dependency system)
        const rightColumnCenterX = width - 85;
        const firstButtonBottomMargin = 76;
        const buttonSize = 75;
        const buttonBorderRadius = 12;
        const threeDotsMarginFromFirstButtonTop = 67;

        const firstButtonBottom = height - firstButtonBottomMargin;
        const firstButtonCenterY = firstButtonBottom - buttonSize / 2;
        const firstButtonTop = firstButtonCenterY - buttonSize / 2;
        const threeDotsCenterY =
          firstButtonTop - threeDotsMarginFromFirstButtonTop;

        const drawShare = (x: number, y: number) => {
          const iconWidth = 74;
          const iconHeight = 62;
          const lineWidth = 6;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const svgSize = 24;
          const scaleX = iconWidth / svgSize;
          const scaleY = iconHeight / svgSize;
          const scale = Math.min(scaleX, scaleY) * 0.9;

          const offsetX = x - (svgSize * scale) / 2;
          const offsetY = y - (svgSize * scale) / 2;

          const scalePoint = (sx: number, sy: number) => ({
            x: offsetX + sx * scale,
            y: offsetY + sy * scale,
          });

          const p1 = scalePoint(22, 2);
          const p2 = scalePoint(11, 13);
          const p3 = scalePoint(15, 22);
          const p4 = scalePoint(2, 9);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        };

        const drawRepost = (x: number, y: number) => {
          const iconWidth = 74;
          const iconHeight = 84;
          const lineWidth = 6;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const svgSize = 24;
          const scaleX = iconWidth / svgSize;
          const scaleY = iconHeight / svgSize;
          const scale = Math.min(scaleX, scaleY) * 0.9;

          const offsetX = x - (svgSize * scale) / 2;
          const offsetY = y - (svgSize * scale) / 2;

          const scalePoint = (sx: number, sy: number) => ({
            x: offsetX + sx * scale,
            y: offsetY + sy * scale,
          });

          const topArrowStart = scalePoint(17, 1);
          const topArrowMid = scalePoint(21, 5);
          const topArrowEnd = scalePoint(17, 9);

          ctx.beginPath();
          ctx.moveTo(topArrowStart.x, topArrowStart.y);
          ctx.lineTo(topArrowMid.x, topArrowMid.y);
          ctx.lineTo(topArrowEnd.x, topArrowEnd.y);
          ctx.stroke();

          const topPathStart = scalePoint(3, 11);
          const topPathArcStart = scalePoint(3, 9);
          const topPathArcEnd = scalePoint(7, 5);
          const topPathEnd = scalePoint(21, 5);

          ctx.beginPath();
          ctx.moveTo(topPathStart.x, topPathStart.y);
          ctx.lineTo(topPathArcStart.x, topPathArcStart.y);
          ctx.quadraticCurveTo(
            topPathArcStart.x,
            topPathArcEnd.y,
            topPathArcEnd.x,
            topPathArcEnd.y,
          );
          ctx.lineTo(topPathEnd.x, topPathEnd.y);
          ctx.stroke();

          const bottomArrowStart = scalePoint(7, 23);
          const bottomArrowMid = scalePoint(3, 19);
          const bottomArrowEnd = scalePoint(7, 15);

          ctx.beginPath();
          ctx.moveTo(bottomArrowStart.x, bottomArrowStart.y);
          ctx.lineTo(bottomArrowMid.x, bottomArrowMid.y);
          ctx.lineTo(bottomArrowEnd.x, bottomArrowEnd.y);
          ctx.stroke();

          const bottomPathStart = scalePoint(21, 13);
          const bottomPathArcStart = scalePoint(21, 15);
          const bottomPathArcEnd = scalePoint(17, 19);
          const bottomPathEnd = scalePoint(3, 19);

          ctx.beginPath();
          ctx.moveTo(bottomPathStart.x, bottomPathStart.y);
          ctx.lineTo(bottomPathArcStart.x, bottomPathArcStart.y);
          ctx.quadraticCurveTo(
            bottomPathArcEnd.x,
            bottomPathArcStart.y,
            bottomPathArcEnd.x,
            bottomPathArcEnd.y,
          );
          ctx.lineTo(bottomPathEnd.x, bottomPathEnd.y);
          ctx.stroke();
        };

        const drawMoreDots = (x: number, centerY: number) => {
          const dotDiameter = 10;
          const dotRadius = dotDiameter / 2;
          const spacingBetweenDots = 7;

          const topDotCenterY =
            centerY - dotRadius - spacingBetweenDots - dotRadius;
          const middleDotCenterY = centerY;
          const bottomDotCenterY =
            centerY + dotRadius + spacingBetweenDots + dotRadius;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

          ctx.beginPath();
          ctx.arc(x, topDotCenterY, dotRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, middleDotCenterY, dotRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, bottomDotCenterY, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        };

        drawMoreDots(rightColumnCenterX, threeDotsCenterY);
        const threeDotsTop = threeDotsCenterY - 12 - 5;

        const shareTextHeight = 28;
        const shareTextCenterY = threeDotsTop - 86;
        const shareTextTop = shareTextCenterY - shareTextHeight / 2;

        const shareIconTextPadding = 36;
        const shareIconHeight = 62;
        const shareIconCenterY =
          shareTextTop - (shareIconTextPadding + shareIconHeight / 2);

        drawShare(rightColumnCenterX, shareIconCenterY);
        const shareIconTop = shareIconCenterY - shareIconHeight / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${shareTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('123', rightColumnCenterX, shareTextCenterY);

        const repostTextMarginFromShareIconTop = 65;
        const repostTextHeight = 28;
        const repostTextCenterY =
          shareIconTop -
          (repostTextMarginFromShareIconTop + repostTextHeight / 2);
        const repostTextTop = repostTextCenterY - repostTextHeight / 2;

        const repostIconTextPadding = 27;
        const repostIconHeight = 84;
        const repostIconCenterY =
          repostTextTop - (repostIconTextPadding + repostIconHeight / 2);
        const repostIconTop = repostIconCenterY - repostIconHeight / 2;

        drawRepost(rightColumnCenterX, repostIconCenterY);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${repostTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('456', rightColumnCenterX, repostTextCenterY);

        const commentTextMarginFromRepostIconTop = 52;
        const commentTextHeight = 28;
        const commentTextCenterY =
          repostIconTop -
          (commentTextMarginFromRepostIconTop + commentTextHeight / 2);
        const commentTextTop = commentTextCenterY - commentTextHeight / 2;

        const commentIconTextPadding = 33;
        const commentIconSize = 74;
        const commentIconCenterY =
          commentTextTop - (commentIconTextPadding + commentIconSize / 2);
        const commentIconTop = commentIconCenterY - commentIconSize / 2;

        const drawComment = (x: number, y: number) => {
          const iconSize = 74;
          const lineWidth = 6;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const svgSize = 24;
          const scale = (iconSize / svgSize) * 0.9;

          const offsetX = x - (svgSize * scale) / 2;
          const offsetY = y - (svgSize * scale) / 2;

          const svgPath =
            'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z';

          const path = new Path2D(svgPath);

          ctx.save();
          ctx.translate(offsetX, offsetY);
          ctx.scale(scale, scale);
          ctx.lineWidth = lineWidth / scale;
          ctx.stroke(path);
          ctx.restore();
        };

        drawComment(rightColumnCenterX, commentIconCenterY);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${commentTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('789', rightColumnCenterX, commentTextCenterY);

        const likesTextMarginFromCommentIconTop = 58;
        const likesTextHeight = 28;
        const likesTextCenterY =
          commentIconTop -
          (likesTextMarginFromCommentIconTop + likesTextHeight / 2);
        const likesTextTop = likesTextCenterY - likesTextHeight / 2;

        const likesIconTextPadding = 36;
        const likesIconHeight = 66;
        const likesIconCenterY =
          likesTextTop - (likesIconTextPadding + likesIconHeight / 2);

        const drawLikes = (x: number, y: number) => {
          const iconWidth = 74;
          const iconHeight = 66;
          const lineWidth = 6;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const svgSize = 24;
          const scaleX = iconWidth / svgSize;
          const scaleY = iconHeight / svgSize;
          const scale = Math.min(scaleX, scaleY) * 0.9;

          const offsetX = x - (svgSize * scale) / 2;
          const offsetY = y - (svgSize * scale) / 2;

          const svgPath =
            'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

          const path = new Path2D(svgPath);

          ctx.save();
          ctx.translate(offsetX, offsetY);
          ctx.scale(scale, scale);
          ctx.lineWidth = lineWidth / scale;
          ctx.stroke(path);
          ctx.restore();
        };

        drawLikes(rightColumnCenterX, likesIconCenterY);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${likesTextHeight}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1.2K', rightColumnCenterX, likesTextCenterY);

        const actionButtonX = rightColumnCenterX - buttonSize / 2;
        const actionButtonY = firstButtonCenterY - buttonSize / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(actionButtonX + buttonBorderRadius, actionButtonY);
        ctx.lineTo(
          actionButtonX + buttonSize - buttonBorderRadius,
          actionButtonY,
        );
        ctx.quadraticCurveTo(
          actionButtonX + buttonSize,
          actionButtonY,
          actionButtonX + buttonSize,
          actionButtonY + buttonBorderRadius,
        );
        ctx.lineTo(
          actionButtonX + buttonSize,
          actionButtonY + buttonSize - buttonBorderRadius,
        );
        ctx.quadraticCurveTo(
          actionButtonX + buttonSize,
          actionButtonY + buttonSize,
          actionButtonX + buttonSize - buttonBorderRadius,
          actionButtonY + buttonSize,
        );
        ctx.lineTo(
          actionButtonX + buttonBorderRadius,
          actionButtonY + buttonSize,
        );
        ctx.quadraticCurveTo(
          actionButtonX,
          actionButtonY + buttonSize,
          actionButtonX,
          actionButtonY + buttonSize - buttonBorderRadius,
        );
        ctx.lineTo(actionButtonX, actionButtonY + buttonBorderRadius);
        ctx.quadraticCurveTo(
          actionButtonX,
          actionButtonY,
          actionButtonX + buttonBorderRadius,
          actionButtonY,
        );
        ctx.closePath();
        ctx.fill();

        // Profile and caption (dependency system: Bottom → Caption → Circle)
        const captionBottomMargin = 65;
        const captionHeight = 46;
        const captionMarginFromCircle = 31;
        const profilePicRadius = 62;
        const profileXLeftMargin = 45;

        const captionBottom = height - captionBottomMargin;
        const captionTop = captionBottom - captionHeight;
        const circleBottom = captionTop - captionMarginFromCircle;
        const profileY = circleBottom - profilePicRadius;
        const profileX = profileXLeftMargin + profilePicRadius;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(profileX, profileY, profilePicRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
        ctx.beginPath();
        ctx.arc(profileX, profileY, profilePicRadius - 1, 0, Math.PI * 2);
        ctx.fill();

        // Username
        const usernameMargin = 22;
        const usernameHeight = 43;
        const usernameX = profileX + profilePicRadius + usernameMargin;
        const usernameText = 'quant_ayoub';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${usernameHeight * 0.65}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(usernameText, usernameX, profileY);

        // Follow button
        const buttonText = 'Follow';
        const buttonMargin = 35;
        const buttonWidth = 190;
        const buttonHeight = 82;
        const borderRadius = 24;
        const buttonX =
          usernameX + ctx.measureText(usernameText).width + buttonMargin;
        const buttonY = profileY - buttonHeight / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.moveTo(buttonX + borderRadius, buttonY);
        ctx.lineTo(buttonX + buttonWidth - borderRadius, buttonY);
        ctx.quadraticCurveTo(
          buttonX + buttonWidth,
          buttonY,
          buttonX + buttonWidth,
          buttonY + borderRadius,
        );
        ctx.lineTo(
          buttonX + buttonWidth,
          buttonY + buttonHeight - borderRadius,
        );
        ctx.quadraticCurveTo(
          buttonX + buttonWidth,
          buttonY + buttonHeight,
          buttonX + buttonWidth - borderRadius,
          buttonY + buttonHeight,
        );
        ctx.lineTo(buttonX + borderRadius, buttonY + buttonHeight);
        ctx.quadraticCurveTo(
          buttonX,
          buttonY + buttonHeight,
          buttonX,
          buttonY + buttonHeight - borderRadius,
        );
        ctx.lineTo(buttonX, buttonY + borderRadius);
        ctx.quadraticCurveTo(buttonX, buttonY, buttonX + borderRadius, buttonY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `bold ${Math.round(buttonHeight * 0.35)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttonText, buttonX + buttonWidth / 2, profileY);

        // Caption
        ctx.textBaseline = 'alphabetic';
        const captionLeftMargin = 47;
        const captionX = captionLeftMargin;
        const captionY = captionTop + captionHeight * 0.85;
        const captionMaxWidth = width - captionLeftMargin - rightMargin - 20;
        const captionText = 'Gonna have to change strategies 😂';

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = `${Math.round(captionHeight * 0.68)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'left';

        let displayText = captionText;
        if (ctx.measureText(captionText).width > captionMaxWidth) {
          const ellipsis = '...';
          let truncatedText = captionText;
          while (
            ctx.measureText(truncatedText + ellipsis).width > captionMaxWidth &&
            truncatedText.length > 0
          ) {
            truncatedText = truncatedText.slice(0, -1);
          }
          displayText = truncatedText + ellipsis;
        }

        ctx.fillText(displayText, captionX, captionY);

        // Safe zone indicator
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(
          contentArea.x,
          contentArea.y,
          contentArea.width,
          contentArea.height,
        );
        ctx.setLineDash([]);

        ctx.restore();
      },
      opacity: 0.85,
    },
  };
}

// Lazy initialization to avoid circular dependency issues
let INSTAGRAM_LAYOUT_CACHE: Layout | null = null;

/**
 * Get the Instagram Reels layout instance.
 *
 * @returns The Instagram layout.
 */
export function getInstagramLayout(): Layout {
  if (!INSTAGRAM_LAYOUT_CACHE) {
    INSTAGRAM_LAYOUT_CACHE = new Layout(createInstagramLayoutConfig());
  }
  return INSTAGRAM_LAYOUT_CACHE;
}
